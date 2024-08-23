// const socket = io();
const socket = io("https://node-pink-chi.vercel.app");

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");
const notiBox = document.querySelector(".new-user-noti");
const notificationMsg = notiBox.querySelector('.notification-msg');
const hideNotiSec = 5000;

let userName = "";

const newUserConnected = async(user) => {
  // debugger;

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("X-Api-Key", "624f306260a843ef8f67442624de2b9f");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow"
  };

  const response = await fetch("https://randommer.io/api/Name?nameType=fullname&quantity=1", requestOptions)
  const newUser = await response.json();

  // userName = user || `User${Math.floor(Math.random() * 1000000)}`;
  userName = user || (newUser[0] != undefined ? `You are: ${newUser[0]}` : `You are: User${Math.floor(Math.random() * 1000000)}`)
  if(!user) {
    document.querySelector('.current-user-name').innerHTML = `(${userName})`;
  }
  socket.emit("new user", userName);
  addToUsersBox(userName);
};

const addToUsersBox = (userName) => {
  // if (!!document.querySelector(`.${userName}-userlist`)) {
  //   return;
  // }

  notificationMsg.innerHTML = `New user added ${userName}`
  notiBox.classList.remove("hidden");
  setTimeout(() => {
    notiBox.classList.add("hidden");
  }, hideNotiSec);
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
  const identify = user === userName ? `(You)` : `(Stranger)`;
  const receivedMsg = `
    <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
            <span class="inline-block w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
              </svg>
            </span>
        </div>
        <div>
            <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-900">${user} ${identify}</span>
                <span class="text-xs text-gray-500">${formattedTime}</span>
            </div>
            <p class="mt-1 text-sm text-gray-700">${message}.</p>
        </div>
    </div>`;
  messageBox.innerHTML += receivedMsg;
};

// new user is created so we generate nickname and emit event
newUserConnected();
var timeout;

function timeoutFunction() {
  socket.emit("typing", false);
}


messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });
  clearTimeout(timeout)
  timeout = setTimeout(timeoutFunction, 1000)
});

socket.on("new user", function (data) {
  data.map((user) => addToUsersBox(user));
});

socket.on("user disconnected", function (userName) {
  // document.querySelector(`.${userName}-userlist`).remove();
  notificationMsg.innerHTML = `${userName} left the chat`
  notiBox.classList.remove("hidden");
  setTimeout(() => {
    notiBox.classList.add("hidden");
  }, hideNotiSec);
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});


socket.on("typing", function (data) {
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = "";
    return;
  }

  fallback.innerHTML = `<p>${nick} is typing...</p>`;
});