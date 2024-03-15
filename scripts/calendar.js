//Class for custom calendar
class Calendar {
  //Constructor gets id of container element and
  //callback function which will be called when user chooses a date
  //calls a function for building a calendar
  constructor(containerId, onDateSelectCallback) {
    this.container = document.getElementById(containerId);
    this.currentMonth = new Date().getMonth();
    this.currentYear = new Date().getFullYear();
    this.onDateSelectCallback = onDateSelectCallback;
    this.selectedDate = null;
    this.buildCalendar();
  }

  //Builds a calendar for current month
  buildCalendar() {
    const daysContainer = this.container.querySelector(".calendar-days");
    daysContainer.innerHTML = ""; //Clear previous days

    const monthYearSpan = this.container.querySelector(".calendar-month-year");
    monthYearSpan.textContent = `${this.getMonthName(this.currentMonth)} ${
      this.currentYear
    }`;

    //Today date
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    //Get the first day of the month
    let firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();

    //Makes first day in week to be monday
    if (firstDay === 0) {
      firstDay = 6;
    } else {
      firstDay -= 1;
    }

    //Add empty cells to the start of the calendar
    //(because month usually doesn't start with monday)
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("day", "empty");
      daysContainer.appendChild(emptyCell);
    }

    //Add the days of the month to the calendar
    const daysInMonth = new Date(
      this.currentYear,
      this.currentMonth + 1,
      0
    ).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day");
      dayCell.textContent = i;

      //Checks is date today, sets class .today to today's date
      if (
        i === todayDate &&
        this.currentMonth === todayMonth &&
        this.currentYear === todayYear
      ) {
        dayCell.classList.add("today");
      }

      dayCell.addEventListener("click", () => {
        if (dayCell.classList.contains("empty")) {
          return;
        }
        this.selectDate(i);
        this.onDateSelectCallback(
          new Date(this.currentYear, this.currentMonth, i)
        );
      });
      daysContainer.appendChild(dayCell);
    }
  }

  getMonthName(monthIndex) {
    const monthNames = [
      "Siječanj",
      "Veljača",
      "Ožujak",
      "Travanj",
      "Svibanj",
      "Lipanj",
      "Srpanj",
      "Kolovoz",
      "Rujan",
      "Listopad",
      "Studeni",
      "Prosinac",
    ];
    return monthNames[monthIndex];
  }

  //Navigates through months
  navigateMonths(step) {
    this.currentMonth += step;

    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }

    this.buildCalendar();
  }

  //Selecting days on click
  selectDate(day) {
    //Finds all days in calendar
    const allDays = this.container.querySelectorAll(".day");

    //Finds selected date
    const selectedDateElement = [...allDays].find(
      (dayElement) =>
        parseInt(dayElement.textContent) === day &&
        !dayElement.classList.contains("empty")
    );

    //Removes class .selected from previously selected date (if there is any)
    if (this.selectedDate) {
      this.selectedDate.classList.remove("selected");
    }

    //Adds class .selected to selected date
    selectedDateElement.classList.add("selected");
    this.selectedDate = selectedDateElement;
  }

  //Resets selected date
  deselectDate() {
    if (this.selectedDate) {
      this.selectedDate.classList.remove("selected");
      this.selectedDate = null;
    }
  }
}

//Initialization of start calendar
const startCalendar = new Calendar("startCalendar", (selectedDate) => {
  //Callback to choose starting date
  document.getElementById("startDate").value = formatDateToDMY(selectedDate);
});

//Initialization of end calendar
const endCalendar = new Calendar("endCalendar", (selectedDate) => {
  //Callback to choose end date
  document.getElementById("endDate").value = formatDateToDMY(selectedDate);
});

//Event listeners for calendar navigation
document
  .getElementById("startCalendar")
  .querySelector(".calendar-prev")
  .addEventListener("click", () => startCalendar.navigateMonths(-1));
document
  .getElementById("startCalendar")
  .querySelector(".calendar-next")
  .addEventListener("click", () => startCalendar.navigateMonths(1));
document
  .getElementById("endCalendar")
  .querySelector(".calendar-prev")
  .addEventListener("click", () => endCalendar.navigateMonths(-1));
document
  .getElementById("endCalendar")
  .querySelector(".calendar-next")
  .addEventListener("click", () => endCalendar.navigateMonths(1));

//Sets date format to DD.MM.YYYY. because its used in Croatia
function formatDateToDMY(date) {
  const d = new Date(date);
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}.`;
}
