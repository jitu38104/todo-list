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

const heading = document.getElementById('listName') as HTMLHeadingElement;
let listData: { title:string, uid: string };

getItem('current_list').then(result => {    
    listData = result;
    heading.innerText = listData.title;
}).catch(err => console.error(err));

db.collection('todo-list').get().then((snapshot:any) => {
    snapshot.docs.map((doc:any) => {
        if(doc.id === listData.uid) {
            const listObj = doc.data();
            let tasksArr = listObj.tasks;
            
            setItem('tasks', JSON.stringify(tasksArr));
            tasksArr.forEach(async(item: any) => {
                await createListHandler(item?.task, item?.id);
            });
        }
    });    
}).catch((err:any) => console.error(err));

const ulTag = document.getElementById('taskBox') as HTMLUListElement;
const formTag = document.getElementById('formSubmit') as HTMLFormElement;
const inpTag = document.querySelector('.taskInp') as HTMLInputElement;

formTag.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const uid: string = Math.floor(Math.random()*1E9).toString();

    console.log(inpTag.value);
    const task: object = { id: uid, task: inpTag.value };    

    if(inpTag.value) {        
        createListHandler(inpTag.value, uid).then(() => {
            let _tasks: any;
            inpTag.value = '';
            getItem('tasks').then(result => {
                _tasks = result;
                _tasks.push(task);

                db.collection('todo-list').doc(listData.uid).update({
                    tasks: _tasks
                }).then(() => {
                    setItem('tasks', JSON.stringify(_tasks));                    
                }).catch((err:any) => console.error(err));
            }).catch(err => console.error(err)); 
        }).catch(err => console.error(err));
    }    
});

const createListHandler = async(task: string, uid: string) => {
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
}

const addEventToDelete = (input:HTMLInputElement) => {
    input.addEventListener('change', ()=> {
        const listTag = input.parentElement as HTMLLIElement;
        const para = input.nextElementSibling as HTMLParagraphElement;
        para.classList.add('strike');
        
        getItem('tasks').then(result => {
            const _tasks = result;
            
            for(let i=0; i<_tasks.length; i++) {
                if(_tasks[i].id === input.id){
                    _tasks.splice(i, 1);
                    break;
                }
            }            

            db.collection('todo-list').doc(listData.uid).update({
                tasks: _tasks
            }).then(() => {
                setItem('tasks', JSON.stringify(_tasks));
            }).catch((err:any) => console.error(err));
        }).catch(err => console.error(err));  
              
        setTimeout(() => listTag.remove(), 2000);
    });
}

