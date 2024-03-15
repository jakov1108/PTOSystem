//Selected HTML elements
const ptoForm = document.getElementById("ptoForm");
const ptoList = document.getElementById("ptoList");
const ptoInfoSection = document.getElementById("ptoInfo");
const loginSection = document.getElementById("login");
const guestMessage = document.getElementById("guestMessage");

//Images for specific seasons
const seasonImages = {
  spring: "url(https://www.034portal.hr/images/109976.jpg)",
  summer:
    "url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmte8lPrKAafJ6VYPk49kZCfWD83h6WPb1Ag&usqp=CAU)",
  autumn: "url(photos/autumn.jpg)",
  winter: "url(photos/winter.jpg)",
};

displayPtoItems();

//Adding a PTO
ptoForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const startDateValue = document.getElementById("startDate").value;
  const endDateValue = document.getElementById("endDate").value;

  const employeeId = document.getElementById("employeeSelect").value;
  const employeeName =
    document.getElementById("employeeSelect").selectedOptions[0].text;

  //Croatian string for date must be converted to Date type
  const startDate = createDateFromString(startDateValue);
  const endDate = createDateFromString(endDateValue);

  //Checks if start is before end date
  if (startDate > endDate) {
    alert("Datum kraja ne može biti prije datuma početka.");
    return;
  }

  //Checks if start and end dates are set
  if (!startDateValue || !endDateValue) {
    alert("Molimo odaberite početni i krajnji datum.");
    return;
  }

  //Resets selected day after submitting PTO
  startCalendar.deselectDate();
  endCalendar.deselectDate();

  //Checks if user is logged in, if he is
  //new PTO is added to local storage and PTO display is refreshed
  if (isUserLoggedIn()) {
    const ptoItem = {
      id: Date.now(),
      startDate: startDateValue,
      endDate: endDateValue,
      employeeId,
      employeeName,
    };
    const ptoList = JSON.parse(localStorage.getItem("ptos")) || [];
    ptoList.push(ptoItem);
    localStorage.setItem("ptos", JSON.stringify(ptoList));
    displayPtoItems();
    ptoForm.reset();
  } else {
    alert("Molimo prijavite se za pregled PTO-a.");
  }
});

//Checks if user is logged or isnt and calls a function
if (isUserLoggedIn()) {
  showPtoInfo();
} else {
  hidePtoInfo();
}

//Shows PTO informations and hides login form
function showPtoInfo() {
  ptoInfoSection.style.display = "block";
  loginSection.style.display = "none";
  guestMessage.style.display = "none";
  fetchEmployees();
}

//Shows login form and hides PTO informations
//disables the cookies by setting their expire date to something in past
function hidePtoInfo() {
  document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  ptoInfoSection.style.display = "none";
  loginSection.style.display = "block";
  guestMessage.style.display = "block";
}

//Function for fetching employees from link
async function fetchEmployees() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();

    //Empty element with something like placeholder in html inputs
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.text = "Odabir osobe...";

    //Fetching employees
    const employeeOptions = data
      .map((user) => `<option value="${user.id}">${user.name}</option>`)
      .join("");

    //Connecting empty option with fetched employees
    document.getElementById("employeeSelect").innerHTML =
      emptyOption.outerHTML + employeeOptions;
  } catch (error) {
    console.error("Greška u dohvaćanju zaposlenika:", error);
    alert("Greška u dohvaćanju zaposlenika!");

    //If fetching fails, only default placeholder will be shown
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.text = "Odabir osobe...";
    document.getElementById("employeeSelect").innerHTML = emptyOption.outerHTML;
  }
}

//Displays PTOs on the site
function displayPtoItems() {
  //Gets the information from localstorage
  const ptoList = JSON.parse(localStorage.getItem("ptos")) || [];
  const ptoListElement = document.getElementById("ptoListView");
  ptoListElement.innerHTML = "";

  //If there is no PTOs hide the element (container)
  if (ptoList.length == 0) {
    ptoListElement.style.display = "none";
  } else {
    ptoListElement.style.display = "inherit";
  }

  //Groups PTOs by employee
  const ptoByEmployee = ptoList.reduce((acc, pto) => {
    const { employeeName } = pto;
    if (!acc[employeeName]) {
      acc[employeeName] = [];
    }
    acc[employeeName].push(pto);
    return acc;
  }, {});

  //Creates a li element for each employee
  for (const employeeName in ptoByEmployee) {
    if (ptoByEmployee.hasOwnProperty(employeeName)) {
      const employeeItemElement = document.createElement("li");
      employeeItemElement.textContent = employeeName;
      employeeItemElement.classList.add("PtoTitle");

      //In every li for one employee, create uls for past, current and upcoming PTOs
      const pastList = document.createElement("ul");
      pastList.textContent = "Prošli PTO-i:";
      pastList.classList.add("PtoSubtitle");
      const currentList = document.createElement("ul");
      currentList.textContent = "Trenutni PTO-i:";
      currentList.classList.add("PtoSubtitle");
      const upcomingList = document.createElement("ul");
      upcomingList.textContent = "Nadolazeći PTO-i:";
      upcomingList.classList.add("PtoSubtitle");

      //Adds HTML elements for every employee to show PTOs
      for (const pto of ptoByEmployee[employeeName]) {
        const ptoStartDate = createDateFromString(pto.startDate);
        const ptoEndDate = createDateFromString(pto.endDate);
        const ptoStatus = compareDates(pto.startDate, pto.endDate);
        const ptoItemElement = document.createElement("li");
        ptoItemElement.classList.add("PTO");
        ptoItemElement.textContent = `Od: ${pto.startDate} Do: ${pto.endDate}`;

        //Adds delete button in every PTO
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Brisanje";
        deleteButton.onclick = () => deletePto(pto.id);
        deleteButton.classList.add("delete-btn");

        ptoItemElement.appendChild(deleteButton);

        //Sets background photo of a PTO based on a season
        const season = getSeason(ptoStartDate);
        ptoItemElement.style.backgroundImage = seasonImages[season];
        ptoItemElement.style.backgroundSize = "cover";
        ptoItemElement.style.color = "black";

        //Decides in which list to add a PTO based on a date
        if (ptoStatus === "past") pastList.appendChild(ptoItemElement);
        else if (ptoStatus === "current")
          currentList.appendChild(ptoItemElement);
        else upcomingList.appendChild(ptoItemElement);
      }

      if (pastList.childNodes.length > 1)
        employeeItemElement.appendChild(pastList);
      if (currentList.childNodes.length > 1)
        employeeItemElement.appendChild(currentList);
      if (upcomingList.childNodes.length > 1)
        employeeItemElement.appendChild(upcomingList);

      ptoListElement.appendChild(employeeItemElement);
    }
  }
}

//Deleting a PTO from site and storage and then refreshes PTOs
function deletePto(ptoId) {
  let ptoList = JSON.parse(localStorage.getItem("ptos")) || [];
  ptoList = ptoList.filter((pto) => pto.id !== ptoId);
  localStorage.setItem("ptos", JSON.stringify(ptoList));
  displayPtoItems();
}

//Decides which season is it based on date
function getSeason(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (
    (month === 3 && day >= 20) ||
    (month > 3 && month < 6) ||
    (month === 6 && day <= 20)
  ) {
    return "spring";
  } else if (
    (month === 6 && day >= 21) ||
    (month > 6 && month < 9) ||
    (month === 9 && day <= 22)
  ) {
    return "summer";
  } else if (
    (month === 9 && day >= 23) ||
    (month > 9 && month < 12) ||
    (month === 12 && day <= 20)
  ) {
    return "autumn";
  } else {
    return "winter";
  }
}

//Functon for converting Croatian date format (string) to default Date format
function createDateFromString(dateStr) {
  dateStr = dateStr.replace(/\.$/, "");

  const parts = dateStr.split(".");

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}

//Function that compares dates (date strings) and decides is
//it in past or current or in future
function compareDates(startDate, endDate) {
  let start = createDateFromString(startDate);
  let end = createDateFromString(endDate);
  let today = new Date();

  if (
    end.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0) ||
    start.setHours(0, 0, 0, 0) == today.setHours(0, 0, 0, 0)
  ) {
    return "current";
  }

  if (end < today) return "past";
  if (start > today) return "upcoming";
  return "current";
}
