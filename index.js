const INDEX_API = 'https://user-list.alphacamp.io/api/v1/users/';
const PER_PAGE_NUMBER = 18; // 資料每頁呈現數量
const MAX_PAGINATION = 5; // 分頁每次呈現數量
const users = [];
let filterUsers = [];
let commons = JSON.parse(localStorage.getItem('Common')) || []; // 設為常用聯絡人清單

let dataPanel = document.querySelector('#data-panel');
let modalAvatar = document.querySelector('#modal-avatar');
let modalInfo = document.querySelector('#modal-info');
let pagination = document.querySelector('.pagination');
let categorys = document.querySelector('.categorys');
let categoryTle = document.querySelector('#category-tle');
let categoryText = document.querySelector('#category-text');
let categoryOpt = document.querySelector('#category-opt');
let formSch = document.querySelector('#form-sch');
let home = document.querySelector('#home');

// All User List
axios
  .get(INDEX_API)
  .then(response => {
    users.push(...response.data.results);
    renderPagination(users);
    renderUsers(sliceDataByPage(users));
    renderCommonsIcon(commons);
  })
  .catch(error => console.log(error));

function renderUsers(data) {
  let userHTML = '';
  data.forEach(user => {
    userHTML += `<div class="user-card col-md-2 mb-3">
        <div class="card" data-id="${user.id}">
          <div>
            <a href="#" class="btn position-absolute top-0 end-0">
              <i class="add-icon fa-solid fa-plus" data-id="${user.id}"></i>
            </a>
          </div>
          <img src="${!user.avatar? "https://fakeimg.pl/300x300" : user.avatar}" class="card-img-top" data-bs-toggle="modal" data-bs-target="#user-modal" alt="avatar">
          <div class="card-body text-center">
            <span class="card-text">${user.name} ${user.surname}</span>
          </div>
        </div>
      </div>`;
  });

  dataPanel.innerHTML = userHTML;
}

// Pick-one
dataPanel.addEventListener('click', event => {
  // Find Id
  let target = event.target;
  while (!target.dataset.id) {
    target = target.parentElement;
  }
  const id = Number(target.dataset.id);
  
  if (event.target.tagName === 'A' || event.target.tagName === 'I') { // Add To Common
    event.preventDefault();
    addToCommon(id);
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

// Add To Common
function renderSingleIcon(addOne, removeOne = null) {
  const icons = document.querySelectorAll('.add-icon') // 當前頁面上所有 "add to common" icon
  // Change Icon
  if (addOne) {
    for (const icon of icons) {
      if (Number(icon.dataset.id) === addOne.id) {
        icon.classList.remove('fa-plus')
        icon.classList.add('fa-thumbtack', 'fa-rotate-by')
        break;
      }
    }
  } else {
    // removeOne
    for (const icon of icons) {
      if (Number(icon.dataset.id) === removeOne.id) {
        icon.classList.add('fa-plus')
        icon.classList.remove('fa-thumbtack', 'fa-rotate-by')
        break;
      }
    }
  }
}

function renderCommonsIcon(commons) {
  const icons = document.querySelectorAll('.add-icon'); // 當前頁面上所有 "add to common" icon
  icons.forEach(icon => {
    if (commons.findIndex(common => Number(icon.dataset.id) === common.id) > -1) {
      icon.classList.remove('fa-plus')
      icon.classList.add('fa-thumbtack', 'fa-rotate-by')
    }
  })
}

function addToCommon(id) {
  const commonIndex = commons.findIndex(list => list.id === id);
  const user = users.find(item => item.id === id);
  
  // 原 none → add
  // 原 add → remove
  if (commonIndex > -1) { 
    const common = commons.find(list => list.id === id)
    commons.splice(commonIndex, 1);
    renderSingleIcon(null, common)
  } else if (user) {
    commons.push(user)
    renderSingleIcon(user)
  }

  localStorage.setItem('Common', JSON.stringify(commons));
}

// Pagination
function renderPagination(data, currentPage = 1) {
  const totalPage = Math.ceil(data.length / PER_PAGE_NUMBER);
  const rangePage = Math.floor(MAX_PAGINATION / 2); // 呈現 ± 幾頁
  let startPage = currentPage - rangePage;

  // 當前頁數含±頁數的資料處理
  if (startPage < 1) {
    startPage = 1;
  } else if (currentPage > totalPage - rangePage) {
    const revPage = totalPage - MAX_PAGINATION + 1 // 從最大頁數反推要從哪頁開始
    startPage = revPage < 1 ? 1 : revPage;
  }

  // 最前頁
  let pgsHTML = `<li class="page-item ${startPage === 1 ? 'disabled' : ''}">
              <a class="page-link" href="#" aria-label="Previous" data-id="${1}">&laquo;</a>
            </li>`;

  // 中間頁
  for (let i = startPage; i <= totalPage; i++) {
    if (i < startPage + MAX_PAGINATION) {
      let isCurrent = currentPage === i ? 'active' : '';
      pgsHTML += `<li class="page-item ${isCurrent}"><a class="page-link" href="#" data-id="${i}">${i}</a></li>`;
    } else break;
  }

  // 最末頁
  pgsHTML += `<li class="page-item ${startPage + MAX_PAGINATION - 1 >= totalPage ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Next" data-id="${totalPage}">&raquo;</a>
          </li>`;

  pagination.innerHTML = pgsHTML;
}

pagination.addEventListener('click', event => {
  if (event.target.classList.contains('page-link')) {
    event.preventDefault();

    const page = Number(event.target.dataset.id);
    const data = filterUsers.length ? filterUsers : users;

    renderPagination(data, page);
    renderUsers(sliceDataByPage(data, page));
    renderCommonsIcon(commons);

    home.click(); // 協助回到頁面頂部
  }
});

function sliceDataByPage(data, currentPage = 1) {
  const startIndex = (currentPage - 1) * PER_PAGE_NUMBER;
  const endIndex = startIndex + PER_PAGE_NUMBER;
  return data.slice(startIndex, endIndex);
}

// Search
formSch.addEventListener('click', event => {
  if (event.target.classList.contains('dropdown-item')) { // change category-title
    event.preventDefault();
    renderCategory(event.target);
  } else if (event.target.classList.contains('search')) { // search
    event.preventDefault();

    // 篩選資料
    const category = categoryTle.dataset.category
    const option = categoryOpt.value
    const keyword = categoryText.value
    filterUsers = FilterUsersList(category, option, keyword).slice()

    if (!filterUsers.length && 
      (((category === "name" || category === "email") && keyword.trim().length) || 
      ((category === "gender" || category === "region") && option.trim().length))
    ) {
      return alert("查無資料！")
    }

    // 重新 Render
    const data = filterUsers.length ? filterUsers : users;
    renderPagination(data);
    renderUsers(sliceDataByPage(data));
    renderCommonsIcon(commons);
    home.click(); // 協助回到頁面頂部
  }
});

function renderCategory(ctg) {
  categorys.querySelector('.active')?.classList.remove('active');
  ctg.classList.add('active');

  // Change category
  categoryTle.dataset.category = ctg.dataset.category;
  categoryTle.innerText = ctg.innerText;
  categoryHidden(ctg.dataset.category)
  
  let options = [];
  let optionHTML = '<option value="" selected>All</option>';
  
  // 綁定 options
  if (ctg.dataset.category === 'gender') {
    users.forEach(user => {
      if (!options.includes(user.gender)) {
        options.push(user.gender)
        optionHTML += `<option value="${user.gender.toLowerCase()}">${user.gender}</option>`
      }
    })
  } else if (ctg.dataset.category === 'region') {
    users.forEach(user => {
      if (!options.includes(user.region)) {
        options.push(user.region)
        optionHTML += `<option value="${user.region.toLowerCase()}">${user.region}</option>`
      }
    })
  }

  categoryOpt.innerHTML = optionHTML;
}

function categoryHidden(category) {
  if (category === 'gender' || category === 'region') {
    categoryOpt.classList.remove('visually-hidden');
    categoryText.classList.add('visually-hidden');

  } else {
    categoryOpt.classList.add('visually-hidden');
    categoryText.classList.remove('visually-hidden');
  }
}

function FilterUsersList(category, option, keyword) {
  let tempUsers = []
  if (category === "name") {
    tempUsers = users.filter(user => (user.name + " " + user.surname).toLowerCase().includes(keyword));
  } else if (category === "email") {
    tempUsers = users.filter(user => user.email.split('@')[0].toLowerCase().includes(keyword));
  } else if (category === "gender") {
    tempUsers = users.filter(user => user.gender.toLowerCase() === option);
  } else if (category === "region") {
    tempUsers = users.filter(user => user.region.toLowerCase() === option);
  }

  return tempUsers
}
