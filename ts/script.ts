import { getItem, setItem } from './utils/localstorage.js';

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBOPm533i2CLm9UzN-Z41k8Fv7_NtU5WJE",
    authDomain: "todo-list-8bf51.firebaseapp.com",
    projectId: "todo-list-8bf51",
    storageBucket: "todo-list-8bf51.appspot.com",
    messagingSenderId: "555032986879",
    appId: "1:555032986879:web:93ac9859e95dd2ad79f8ca"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
db.settings({ merge: true });

const newBtn = document.querySelector('.new-btn') as HTMLButtonElement;
const existBtn = document.querySelector('.exist-btn') as HTMLButtonElement;
const closeBtn = document.querySelector('.close') as HTMLButtonElement ;
const popupBox = document.querySelector('.popup') as HTMLDivElement;
const spanBox = document.getElementById('spanCheck') as HTMLSpanElement;
const formTag = document.querySelector('#popupForm') as HTMLFormElement;
const listTitle = document.getElementById('todoTitle') as HTMLInputElement;
const nxtPageLink = document.getElementById('goto') as HTMLAnchorElement;
const createBtn = document.createElement('button');
createBtn.setAttribute('type', 'submit');

//fetching all titles
const allTodoListTitles : string[] = [];
db.collection('todo-list').get().then((snapshot:any) => {
    snapshot.docs.map((doc:any) => {
        const title: string = doc.data().Title;
        allTodoListTitles.push(title);
    });
});

//events on popups
newBtn.addEventListener('click', () => {
    console.log(allTodoListTitles);
    
    popupBox.classList.toggle('scale');
    spanBox.style.display = 'block';
    createBtn.innerHTML = 'Create';
    createBtn.setAttribute('class', 'new');
    createBtn.style.backgroundColor = '#2ecc71';
    formTag.appendChild(createBtn);
});

existBtn.addEventListener('click', () => {
    popupBox.classList.toggle('scale');
    spanBox.style.display = 'none';
    createBtn.innerHTML = 'Find';
    createBtn.setAttribute('class', 'exist');
    createBtn.style.backgroundColor = '#f1c40f';
    formTag.appendChild(createBtn);
});

closeBtn.addEventListener('click', () => {
    popupBox.classList.toggle('scale');
    addAlertMsgHandler('remove');
});

listTitle.addEventListener('change', ()=> addAlertMsgHandler('remove'));

formTag.addEventListener('submit', (e: Event) => {
    e.preventDefault();            
    const uid:string = Math.floor(Math.random()*1E15).toString();
    const ElemArr: any[] = [];

    ElemArr.push(e.target);   
    const className: string = ElemArr[0][2].getAttribute('class');    
    const title: string = listTitle.value;
    
    if(className === 'new') { 
        const compNum: number = isAlreadyExist(title) || 0;
        
        if(compNum > 0) {
            const newList:object = { title: title, uid: uid };

            getItem('lists').then(result => {
                if(result){
                    const listArr:object[] = result;
                    listArr.push(newList);
                    setItem('lists', JSON.stringify(listArr));
                    setItem('current_list', JSON.stringify(newList));
                } else {
                    setItem('lists', JSON.stringify([newList]));
                    setItem('current_list', JSON.stringify(newList));
                }

                db.collection('todo-list').doc(uid).set({
                    Title: title,
                    tasks: []
                }).then(() => {
                    popupBox.classList.toggle('scale');
                    nxtPageLink.click();
                }).catch((err:any) => console.error(err));
            }).catch((err:any) => console.error(err));
        } else {
            if(compNum === -2){
                addAlertMsgHandler('add', title, 'empty');
            } else if(compNum < 0) {
                addAlertMsgHandler('add', title, 'checkbox');
            } else {
                addAlertMsgHandler('add', title, 'new');
            }                
        }       
    } else {
        if(!title){
            addAlertMsgHandler('add', title, 'empty');
        } else {
            getItem('lists').then(result => {    
                for(let item of result) {
                    if(title === item.title){
                        setItem('current_list', JSON.stringify(item));
                        popupBox.classList.toggle('scale');
                        nxtPageLink.click();
                        break;
                    }               
                }
                addAlertMsgHandler('add', title, 'exist');
            }).catch(err => console.error(err));
        }        
    }
    listTitle.value = '';    
});

const isAlreadyExist = (title:string) => {
    const checkboxTag = document.getElementById('agree') as HTMLInputElement;

    if(!title) return -2;

    if(checkboxTag.checked) {       
        for(let name of allTodoListTitles) {
            if(title === name) {            
                return 0;
            }
        }
        return 1;
    } else {
        return -1;
    }    
}

const addAlertMsgHandler = (type:string, title:any=null, btn?:string) => {
    const paraTag = document.getElementById("nonExistTitle") as HTMLParagraphElement;    
    
    if(type === 'add') {
        let alert: string;
        switch(btn) {
            case 'new':
                alert = `* ${title} already exists!`;
                break;
            case 'exist':
                alert = `* ${title} does not exist!`;
                break;
            case 'checkbox':
                alert = `*you need to agree with our conditions.`;
                break;
            default:
                alert = `*input field should not be empty.`
                break;
        }

        paraTag.innerHTML= alert;
    } else {
        paraTag.innerHTML = '';
    }
}