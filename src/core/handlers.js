import Swal from "sweetalert2";
import { rowRender, rowUi, toast, url } from "./functions";
import { courseEditForm, courseForm, editDrawer, rowGroup } from "./selector";

export const courseFormHandler = (event) => {
  event.preventDefault();

  const formData = new FormData(courseForm);

  const jsonData = JSON.stringify({
    title: formData.get("course_title"),
    short_name: formData.get("short_name"),
    fee: formData.get("course_fee"),
  });

  courseForm.querySelector("button").toggleAttribute("disabled");
  const myHeader = new Headers();
  myHeader.append("Content-Type", "application/json");

  fetch(url("/courses"), {
    method: "POST",
    body: jsonData,
    headers: myHeader,
  })
    .then((res) => res.json())
    .then((json) => {
      rowGroup.append(rowUi(json));
      courseForm.reset();
      courseForm.querySelector("button").toggleAttribute("disabled");
      toast("Course creation successful.");
    });
};

export const rowGroupHandler = (event) => {
  if (event.target.classList.contains("row-del")) {
    const currentRow = event.target.closest("tr");
    const currentRowId = currentRow.getAttribute("row-id");

    const myHeader = new Headers();
    myHeader.append("Content-Type", "application/json");

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        currentRow.querySelector(".row-del").toggleAttribute("disabled");

        fetch(url(`/courses/${currentRowId}`), {
          method: "DELETE",
          headers: myHeader,
        }).then((res) => {
          if (res.status === 204) {
            currentRow.querySelector(".row-del").toggleAttribute("disabled");
            toast("Course deleted!");
            currentRow.classList.add(
              "animate__animated",
              "animate__zoomOutLeft",
              "duration-300"
            );
            currentRow.addEventListener("animationend", () => {
              currentRow.remove();
            });
          }
        });
      }
    });
  } else if (event.target.classList.contains("row-edit")) {
    const currentRow = event.target.closest("tr");
    const currentRowId = currentRow.getAttribute("row-id");

    currentRow.querySelector(".row-edit").toggleAttribute("disabled");

    fetch(url("/courses/" + currentRowId))
      .then((res) => res.json())
      .then((json) => {
        currentRow.querySelector(".row-edit").toggleAttribute("disabled");

        courseEditForm.querySelector("#edit_course_id").value = json.id;
        courseEditForm.querySelector("#edit_course_title").value = json.title;
        courseEditForm.querySelector("#edit_short_name").value =
          json.short_name;
        courseEditForm.querySelector("#edit_course_fee").value = json.fee;
        editDrawer.show();
      });
  }
};

export const courseEditFormHandler = (event) => {
  event.preventDefault();
  const formData = new FormData(courseEditForm);
  const currentId = formData.get("edit_course_id");

  const jsonData = JSON.stringify({
    title: formData.get("edit_course_title"),
    short_name: formData.get("edit_short_name"),
    fee: formData.get("edit_course_fee"),
  });

  const myHeader = new Headers();
  myHeader.append("Content-Type", "application/json");

  courseEditForm.querySelector("button").toggleAttribute("disabled");

  fetch(url("/courses/" + currentId), {
    method: "PUT",
    body: jsonData,
    headers: myHeader,
  })
    .then((res) => res.json())
    .then((json) => {
      courseEditForm.querySelector("button").toggleAttribute("disabled");
      courseEditForm.reset();
      editDrawer.hide();
      toast("updated");

      const currentRow = rowGroup.querySelector(`tr[row-id ="${json.id}"]`);
      currentRow.querySelector(".row-title").innerText = json.title;
      currentRow.querySelector(".row-short").innerText = json.short_name;
      currentRow.querySelector(".row-fee").innerText = json.fee;
    });
};

export const editCellHandler = (event) => {
  if (event.target.classList.contains("cell-editable")) {
    const currentRow = event.target.closest("tr");
    const currentRowId = currentRow.getAttribute("row-id");
    const currentCell = event.target;
    const currentCellColName = currentCell.getAttribute("cell-col");
    const currentText = currentCell.innerText;
    currentCell.innerText = "";

    const input = document.createElement("input");
    input.className =
      "w-[70%] m-0 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
    input.value = currentText;

    currentCell.append(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newValue = input.value;
      currentCell.innerText = newValue;

      const myHeader = new Headers();
      myHeader.append("Content-Type", "application/json");

      const updatedData = {};

      updatedData[currentCellColName] = newValue;

      const jsonData = JSON.stringify(updatedData);

      fetch(url("/courses/" + currentRowId), {
        method: "PATCH",
        headers: myHeader,
        body: jsonData,
      })
        .then((res) => res.json())
        .then((json) => {
          toast("Update Successful");
        });
    });
  }
};

export const searchInputHandler = (event) => {
  event.target.previousElementSibling.innerHTML = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-4 h-4 animate-spin"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>`;

  fetch(url("/courses?title[like]=" + event.target.value))
    .then((res) => res.json())
    .then((json) => {
      event.target.previousElementSibling.innerHTML = `       
      <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>`;
      if (json.length) {
        rowRender(json);
      } else {
        toast("No course found!");
        rowGroup.innerHTML = `
        <tr>
          <td colspan="5" class="text-center px-6 py-4">There is no course!
          <a href="http://${location.host}">Browse all.</a>
          </td>
        </tr>
        `;
      }
    });
};
