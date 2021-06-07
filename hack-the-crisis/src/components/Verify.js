import { render } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { storage } from '../firebase';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';

function Verify() {
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [source, setSource] = useState(null);
  const [similarity, setSimilarity] = useState(null);
  const [message, setMessage] = useState('No medicine');
  const [usecolor, setColor] = useState('black');
  let srce, imgSRC, dynamicImage;
  const history = useHistory();

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    if (similarity) {
      if (similarity > 0.99) {
        setMessage('Original Medicine');
        setColor('green');
      } else {
        setMessage('DuplicateMedicine');
        setColor('red');
      }
    }

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, similarity]);

  const gotoHome = () => {
    history.push('/');
  };

  const onImageChange = (e) => {
    // const reader = new FileReader();
    // let file = ref;
    // if (file) {
    //   reader.onload = () => {
    //     if (reader.readyState === 2) {
    //       console.log(file);
    //       setImage(file);
    //       src = file.name;
    //     }
    //   };
    //   reader.readAsDataURL(e.target.files[0]);
    //   // if there is no file, set image back to null
    // } else {
    //   setImage(null);
    // }

    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }

    // I've kept this example simple by using the first image instead of multiple
    setSelectedFile(e.target.files[0]);
  };

  // const setImageSource = async (imgSrc) => {

  // };

  const uploadToFirebase = async () => {
    document.getElementById('outputImage').src = '/assets/placeholder.png';
    //1.
    if (selectedFile) {
      //2.

      const storageRef = storage.ref();
      //3.
      const imageRef = storageRef.child(selectedFile.name);
      //4.
      await imageRef
        .put(selectedFile)
        //5.
        .then(() => {
          alert('Image uploaded successfully to Firebase.');
        });

      console.log(selectedFile.name);
      const fileName = { name: selectedFile.name };
      var data = new FormData();
      data.append('name', selectedFile.name);
      await fetch(`//localhost:5000/upload`, {
        method: 'POST',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data.SimilarityScore);
          setSimilarity(data.SimilarityScore);
          document.getElementById('outputImage').src = '/assets/after.jpg';
        });
      // console.log('Similarity Score', response);
      // srce = await new Promise(function (resolve, reject) {
      //   setTimeout(() => {
      //     resolve('../../../api/downloads/after.jpg');
      //     document.getElementById('outputImage').src =
      //       'C:\\Users\\AAVAIG\\Documents\\webd\\hack-the-crisis\\apidownloads\\after.jpg';
      //   }, 3000);
      // });

      // console.log(srce);
      // const images = require.context('../../../api/downloads', true);
      // await createImage(srce);

      // dynamicImage = images(`./${srce}`);
      // console.log(dynamicImage);
      console.log(document.getElementById('outputImage'));

      // setImageSource(srce);
      // setTimeout(() => {
      //   setSource('../../../api/downloads/after.jpg');
      // }, 10000);
    } else {
      alert('Please upload an image first.');
    }
  };

  return (
    <Container>
      <Content>
        <UploadImageContainer>
          <Input
            type='file'
            accept='image/x-png,image/jpeg'
            name='user[image]'
            onChange={(e) => {
              onImageChange(e);
            }}
            className='custom-file-input'
          />
          {selectedFile ? (
            <UploadImage src={preview} />
          ) : (
            <UploadImage src='/assets/placeholder.png' />
          )}
        </UploadImageContainer>
        <ReceivedImageContainer>
          <ReceivingMessage style={{ color: `${usecolor}` }}>
            Message : {`${message} ,Similarity : ${similarity * 100}%`}
          </ReceivingMessage>
          <img src='/assets/placeholder.png' alt='' id='outputImage' />
          <AdditionalMessage>
            <p className='warning'>
              The red portion on the output image(if any) tells that this is a
              duplicate medicine
            </p>
            <p className='message'>
              You can find original medicine(if you own a duplicate one) at any
              local store around you but ensure that they have the same marks as
              detected here
            </p>
          </AdditionalMessage>
        </ReceivedImageContainer>
      </Content>
      <Button>
        <button onClick={uploadToFirebase}>Upload Image</button>
        <button onClick={gotoHome}>Go Back</button>
      </Button>
    </Container>
  );
}

export default Verify;

const Container = styled.div`
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Content = styled.div`
  min-height: 20rem;

  margin-bottom: 2rem;
  display: flex;
  width: 90%;
`;

const Input = styled.input`
  &.custom-file-input {
    // width: 50rem;
    &::-webkit-file-upload-button {
      visibility: hidden;
      display: none;
    }
    &::before {
      content: 'Select Image';
      display: inline-block;
      background: var(--color-blueberry);
      border: 1px solid #999;
      border-radius: 3px;
      padding: 5px 8px;
      outline: none;
      white-space: nowrap;
      -webkit-user-select: none;
      cursor: pointer;
      // text-shadow: 1px 1px #fff;
      font-weight: 700;
      font-size: 15px;
      margin-right: 1rem;
      color: var(--color-apple-core);
    }
    &:hover::before {
      border-color: black;
    }
    &:active::before {
      background: var(--color-apple-core);
    }
  }
`;

const Button = styled.div`
  button {
    background: var(--color-blueberry);
    border: none;
    outline: none;
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-citrus);
    padding: 1rem 2rem;
    letter-spacing: 1.3px;
    border-radius: 6px;
    transition: all 250ms;
    margin-right: 2rem;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(-1px);
    }
  }
`;

const UploadImage = styled.img`
  margin-top: 2rem;
  width: 30rem;
  height: 30rem;
`;

const UploadImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 50%;
`;

const ReceivedImageContainer = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    margin-top: 2rem;
    width: 30rem;
    height: 30rem;
  }
`;

const ReceivingMessage = styled.h2`
  width: 100%;
  text-align: center;
  padding: 0.5rem 0;
`;

const AdditionalMessage = styled.div`
  margin-top: 2rem;

  .message,
  .warning {
    font-size: 1.4rem;
    text-align: center;
    margin-bottom: 1rem;
    font-weight: 500;
  }
`;
