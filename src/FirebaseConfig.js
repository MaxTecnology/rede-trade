// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyClL6iKLuzLjju7a6TtN9XO0tUUNOSTHO0",
    authDomain: "imagehostredetrade.firebaseapp.com",
    projectId: "imagehostredetrade",
    storageBucket: "imagehostredetrade.appspot.com",
    messagingSenderId: "737297405267",
    appId: "1:737297405267:web:a7b21c986d8ea274533da6"
};

// ==========================================
// ====== Initialize Firebase
// ==========================================
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export async function uploadFile(file) {

    // Simula um delay de upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retorna uma URL fictícia
    console.log("📸 Simulando upload de:", file.name);
    
    // Opções de URLs fictícias:
    // 1. URL de placeholder
    //return `https://via.placeholder.com/150?text=${file.name}`;
    
    // 2. Ou use um serviço de imagem aleatória
    return `https://picsum.photos/200/200?random=${Date.now()}`;
    
    // 3. Ou retorne sempre a mesma imagem
    // return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";


    // Referência para o armazenamento
    // const storage = getStorage();
    // const storageReference = storageRef(storage, `files/${file.name}`);

    // // Upload do arquivo para o armazenamento
    // await uploadBytes(storageReference, file);
    // const downloadURL = await getDownloadURL(storageReference);
    // return downloadURL
}