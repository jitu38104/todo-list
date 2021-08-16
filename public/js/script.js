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
const newBtn = document.querySelector('.new-btn');
const existBtn = document.querySelector('.exist-btn');
const closeBtn = document.querySelector('.close');
const popupBox = document.querySelector('.popup');
const spanBox = document.getElementById('spanCheck');
const formTag = document.querySelector('#popupForm');
const listTitle = document.getElementById('todoTitle');
const nxtPageLink = document.getElementById('goto');
const createBtn = document.createElement('button');
createBtn.setAttribute('type', 'submit');
//fetching all titles
const allTodoListTitles = [];
db.collection('todo-list').get().then((snapshot) => {
    snapshot.docs.map((doc) => {
        const title = doc.data().Title;
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
listTitle.addEventListener('change', () => addAlertMsgHandler('remove'));
formTag.addEventListener('submit', (e) => {
    e.preventDefault();
    const uid = Math.floor(Math.random() * 1E15).toString();
    const ElemArr = [];
    ElemArr.push(e.target);
    const className = ElemArr[0][2].getAttribute('class');
    const title = listTitle.value;
    if (className === 'new') {
        const compNum = isAlreadyExist(title) || 0;
        if (compNum > 0) {
            const newList = { title: title, uid: uid };
            getItem('lists').then(result => {
                if (result) {
                    const listArr = result;
                    listArr.push(newList);
                    setItem('lists', JSON.stringify(listArr));
                    setItem('current_list', JSON.stringify(newList));
                }
                else {
                    setItem('lists', JSON.stringify([newList]));
                    setItem('current_list', JSON.stringify(newList));
                }
                db.collection('todo-list').doc(uid).set({
                    Title: title,
                    tasks: []
                }).then(() => {
                    popupBox.classList.toggle('scale');
                    nxtPageLink.click();
                }).catch((err) => console.error(err));
            }).catch((err) => console.error(err));
        }
        else {
            if (compNum === -2) {
                addAlertMsgHandler('add', title, 'empty');
            }
            else if (compNum < 0) {
                addAlertMsgHandler('add', title, 'checkbox');
            }
            else {
                addAlertMsgHandler('add', title, 'new');
            }
        }
    }
    else {
        if (!title) {
            addAlertMsgHandler('add', title, 'empty');
        }
        else {
            getItem('lists').then(result => {
                for (let item of result) {
                    if (title === item.title) {
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
const isAlreadyExist = (title) => {
    const checkboxTag = document.getElementById('agree');
    if (!title)
        return -2;
    if (checkboxTag.checked) {
        for (let name of allTodoListTitles) {
            if (title === name) {
                return 0;
            }
        }
        return 1;
    }
    else {
        return -1;
    }
};
const addAlertMsgHandler = (type, title = null, btn) => {
    const paraTag = document.getElementById("nonExistTitle");
    if (type === 'add') {
        let alert;
        switch (btn) {
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
                alert = `*input field should not be empty.`;
                break;
        }
        paraTag.innerHTML = alert;
    }
    else {
        paraTag.innerHTML = '';
    }
};
