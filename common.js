const INDEX_API = 'https://user-list.alphacamp.io/api/v1/users/';
const users = JSON.parse(localStorage.getItem('Common')) || [];

let dataPanel = document.querySelector('#data-panel');
let modalAvatar = document.querySelector('#modal-avatar');
let modalInfo = document.querySelector('#modal-info');
let pagination = document.querySelector('.pagination');

// All User List
renderUsers(users)

function renderUsers(data) {
  let cardHTML = '';
  data.forEach(user => {
    cardHTML += `<div class="user-card col-md-2 mb-3">
        <div class="card" data-id="${user.id}">
          <div>
            <a href="#" class="btn position-absolute top-0 end-0">
              <i class="add-icon fa-solid fa-xmark" data-id="${user.id}"></i>
            </a>
          </div>
          <img src="${!user.avatar ? "https://fakeimg.pl/300x300" : user.avatar}" class="card-img-top" data-bs-toggle="modal" data-bs-target="#user-modal" alt="avatar">
          <div class="card-body text-center">
            <span class="card-text">${user.name} ${user.surname}</span>
          </div>
        </div>
      </div>`;

  });

  dataPanel.innerHTML = cardHTML;
}

// Pick-one
dataPanel.addEventListener('click', event => {
  // Find Id
  let target = event.target;
  while (!target.dataset.id) {
    target = target.parentElement;
  }
  const id = Number(target.dataset.id);

  if (event.target.tagName === 'A' || event.target.tagName === 'I') { // remove from Common
    event.preventDefault();
    removeFromCommon(id);
    renderUsers(users)
  } else { // Show Info Detail
    axios
      .get(INDEX_API + id)
      .then(response => {
        showInfoDetail(response.data);
      })
      .catch(error => console.log(error));
  }
});

function showInfoDetail(user) {
  const name = user.name + ' ' + user.surname;
  const gender = user.gender === "female" ? "fa-venus" : "fa-mars"
  const birth = new Date(user.birthday)
  const born = `${birth.getFullYear()}/${String(birth.getMonth()).padStart(2, '0')}/${String(birth.getDate()).padStart(2, '0')}`

  modalAvatar.src = !user.avatar ? "" : user.avatar;
  modalInfo.innerHTML = 
            `<li class="list-group-item"><i class="fa-solid fa-user"></i>：${name} <i class="fa-solid ${gender}"></i></li>
              <li class="list-group-item"><i class="fa-solid fa-earth-americas"></i>：${user.region}</li>
              <li class="list-group-item"><i class="fa-solid fa-cake-candles"></i>：${born} (${user.age})</li>
              <li class="list-group-item"><i class="fa-regular fa-envelope"></i>：${user.email}</li>`;
}

function removeFromCommon(id) {
  const idIndex = users.findIndex(list => list.id === id);
  if (idIndex > -1) {
    users.splice(idIndex, 1);
  }

  localStorage.setItem('Common', JSON.stringify(users));
}