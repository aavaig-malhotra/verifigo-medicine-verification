from typing import final
from PIL import Image
import pytesseract
import cv2
import matplotlib.pyplot as plt
import os
from pathlib import Path
from skimage import io
from flask import Flask, json,request,jsonify
import pyrebase
from flask import Flask, render_template, request
from flask_cors import CORS
import urllib.request
import firebase
from skimage.metrics import structural_similarity
import skimage
import numpy as np


def get_main_alternate(image):
    pytesseract.pytesseract.tesseract_cmd =r"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
    txt = pytesseract.image_to_string(image)
    Med = { 'Crocin' : ['Algina', 'Cipmol','Dolo','Paracip', 'Febrex'] ,
    'Remdesivir' : ['Dexamethasone','FabiFlu '],
    'Ecospirin' : ['Sprin', 'Aspidot','CV sprin'] ,
    'Cetzine' : ['Sizon', 'Cetriver','Okacet'] ,
    'Zincovit' : ['Zinconia', 'New Celin','A to Z NS'] ,
    'Demisone' : ['Dexona', 'Decdan','Wymesone'] ,
    'Wincold' : ['Flu-4-XN', 'Saczine-Cold','Fluban', 'Helcet plus' ] ,
    'Aciloc' : ['Zinemac', 'Ranitas','Rafilon', 'Zynol'] ,
    'Omez Capsule' : ['Omesec 20', 'Omecip Capsule','Promisec'],
    'Razo 20' : ['Cyra', 'Rabid','Pepcia 20', 'Raboni'],
    'Brufen' : ['IBUFLAMAR', 'Bruriff','ALFAM', 'Maxofen'],
    'Azithromycin' : ['Zithrozem', 'Zady','Azax'],
    'Betnesol' : ['Cortil', 'Betaken','Betapen', 'Cortibet'],
    'Ciprobid' : ['Ciprokind', 'Alciflox','Ceepro', 'Ciplox'],
    'Catef O' : ['Cefaxime O', 'Neeflox O','Surgicef O', 'Pelflix O'],
    }
    txt = list(txt.split())
    print(txt)
    result = {}
    for key, value in Med.items():
        for j in txt:
            print(j.lower())
            j = j.lower()
            key = key.lower()
            if key in j:
                result['main'] = key
                result['alternate'] = value
                return result
            else:
                continue
    return result

config = {
  "apiKey": "AIzaSyBA-tkg_QQPHZez-OvJbYw2iYXf3KYOPCI",
  "authDomain": "verifigo-4e296.firebaseapp.com",
  "projectId": "verifigo-4e296",
  "storageBucket": "verifigo-4e296.appspot.com",
  "messagingSenderId": "1064700887747",
  "appId": "1:1064700887747:web:4c61b78acffbe44e759876",
  "measurementId": "G-DXLESFN9C5",
  "databaseURL" : ""
};



firebase = pyrebase.initialize_app(config)
storage = firebase.storage()
auth = firebase.auth()


admin_email = "1@2.com"
admin_password = "123456"
# auth.create_user_with_email_and_password(admin_email, admin_password)
user = auth.sign_in_with_email_and_password(admin_email, admin_password)

app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app)


def get_final_image(false_path, true_path):

    before = io.imread(false_path)
    after = io.imread(true_path)

    before_gray = io.imread(false_path, as_gray=True)
    after_gray = io.imread(true_path, as_gray=True)

    # Compute SSIM between two images
    (score, diff) = structural_similarity(before_gray, after_gray, full=True)
    print("Image similarity", score)
    diff = (diff * 255).astype("uint8")
    thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    contours = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = contours[0] if len(contours) == 2 else contours[1]

    mask = np.zeros(before.shape, dtype='uint8')
    filled_after = after.copy()

    for c in contours:
        area = cv2.contourArea(c)
        if area > 40:
            x,y,w,h = cv2.boundingRect(c)
            cv2.rectangle(before, (x, y), (x + w, y + h), (36,255,12), 2)
            cv2.rectangle(after, (x, y), (x + w, y + h), (0,0,255), 5)
            cv2.drawContours(mask, [c], 0, (0,255,0), -1)
            cv2.drawContours(filled_after, [c], 0, (0,255,0), -1)

    cv2.imwrite("C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\downloads\\after.jpg",after)
    cv2.imwrite("C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\hack-the-crisis\\public\\assets\\after.jpg", after)
    return score


def get_image(file_name):
    image_name = str(file_name)
    print(image_name)
    # Get false image from firebase
    url = storage.child(image_name).get_url(token=user['idToken'])
    urllib.request.urlretrieve(url=url, filename=f"C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\downloads\\{image_name}")

    final_result = 0
    # Process false image
    image = Image.open(f"C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\downloads\\{image_name}")
    result = get_main_alternate(image)
    if result['main'] is not None:
        main = result["main"].lower()




        # Get false true image from firebase
        url = storage.child(f'medicine/{main}.jpg').get_url(token=user['idToken'])
        urllib.request.urlretrieve(url=url, filename=f"C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\true.jpg")


            
        # Get final image
        final_result = get_final_image(f"C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\downloads\\{image_name}", f"C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\api\\true.jpg")

    
    return final_result

@app.route('/upload', methods=['POST'])
def upload_file():
    print("Hello youtube")
    data = request.form.to_dict()
    fileName = data['name']
    data = get_image(fileName)
    res = {"SimilarityScore" : data}
    return jsonify(res)




app.run()
