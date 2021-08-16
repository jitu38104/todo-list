var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const heading = document.getElementById('listName');
let listData;
getItem('current_list').then(result => {
    listData = result;
    heading.innerText = listData.title;
}).catch(err => console.error(err));
db.collection('todo-list').get().then((snapshot) => {
    snapshot.docs.map((doc) => {
        if (doc.id === listData.uid) {
            const listObj = doc.data();
            let tasksArr = listObj.tasks;
            setItem('tasks', JSON.stringify(tasksArr));
            tasksArr.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
                yield createListHandler(item === null || item === void 0 ? void 0 : item.task, item === null || item === void 0 ? void 0 : item.id);
            }));
        }
    });
}).catch((err) => console.error(err));
const ulTag = document.getElementById('taskBox');
const formTag = document.getElementById('formSubmit');
const inpTag = document.querySelector('.taskInp');
formTag.addEventListener('submit', (e) => {
    e.preventDefault();
    const uid = Math.floor(Math.random() * 1E9).toString();
    console.log(inpTag.value);
    const task = { id: uid, task: inpTag.value };
    if (inpTag.value) {
        createListHandler(inpTag.value, uid).then(() => {
            let _tasks;
            inpTag.value = '';
            getItem('tasks').then(result => {
                _tasks = result;
                _tasks.push(task);
                db.collection('todo-list').doc(listData.uid).update({
                    tasks: _tasks
                }).then(() => {
                    setItem('tasks', JSON.stringify(_tasks));
                }).catch((err) => console.error(err));
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }
});
const createListHandler = (task, uid) => __awaiter(void 0, void 0, void 0, function* () {
    const listTag = document.createElement('li');
    const paraTag = document.createElement('p');
    paraTag.innerText = task;
    const inputTag = document.createElement('input');
    inputTag.setAttribute('type', 'checkbox');
    inputTag.setAttribute('id', uid);
    addEventToDelete(inputTag);
    listTag.appendChild(inputTag);
    listTag.appendChild(paraTag);
    ulTag.appendChild(listTag);
});
const addEventToDelete = (input) => {
    input.addEventListener('change', () => {
        const listTag = input.parentElement;
        const para = input.nextElementSibling;
        para.classList.add('strike');
        getItem('tasks').then(result => {
            const _tasks = result;
            for (let i = 0; i < _tasks.length; i++) {
                if (_tasks[i].id === input.id) {
                    _tasks.splice(i, 1);
                    break;
                }
            }
            db.collection('todo-list').doc(listData.uid).update({
                tasks: _tasks
            }).then(() => {
                setItem('tasks', JSON.stringify(_tasks));
            }).catch((err) => console.error(err));
        }).catch(err => console.error(err));
        setTimeout(() => listTag.remove(), 2000);
    });
};
