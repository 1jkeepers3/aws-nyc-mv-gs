let searchForm = document.getElementById("searchForm");
let searchForm2 = document.getElementById("searchForm2");

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    let keyword = document.getElementById("keyword").value.trim();
    let borough = document.getElementById("borough").value;
    let dateFrom = document.getElementById("dateFrom").value;
    let dateTo = document.getElementById("dateTo").value;

    let isKeywordEmpty = keyword.length === 0;
    let isBoroughEmpty = borough === "All";
    let isDateFromEmpty = dateFrom.length === 0;
    let isDateToEmpty = dateTo.length === 0;

    if (isKeywordEmpty && isBoroughEmpty && isDateFromEmpty && isDateToEmpty) {
      event.preventDefault();
      alert("Please enter at least one search criteria before searching");
    }
  });
} else if (searchForm2) {
  searchForm2.addEventListener("submit", (event) => {
    let vehicleId = document.getElementById("vehicleId").value.trim();
    let vehicleType = document.getElementById("vehicleType").value.trim();
    let make = document.getElementById("make").value.trim();
    let model = document.getElementById("model").value.trim();
    let year = document.getElementById("year").value.trim();

    let isVehicleIdEmpty = vehicleId.length === 0;
    let isVehicleTypeEmpty = vehicleType.length === 0;
    let isMakeEmpty = make.length === 0;
    let isModelEmpty = model.length === 0;
    let isYearEmpty = year.length === 0;

    if (
      isVehicleIdEmpty &&
      isVehicleTypeEmpty &&
      isMakeEmpty &&
      isModelEmpty &&
      isYearEmpty
    ) {
      event.preventDefault();
      alert("Please enter at least one search criteria before searching");
    }
  });
}
