// Get all checkboxes
const checkboxes = document.querySelectorAll(".task-list input[type='checkbox']");

// Load saved task status
checkboxes.forEach((checkbox, index) => {

    const saved = localStorage.getItem("task" + index);

    if (saved !== null) {
        checkbox.checked = (saved === "true");
    }

    checkbox.addEventListener("change", function () {

        localStorage.setItem("task" + index, checkbox.checked);

    });

});