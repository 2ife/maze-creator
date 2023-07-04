const mazeSettingModal = document.querySelector(
    ".mazeSettingModal"
  ) as HTMLDialogElement,
  mazeSettingValueContainers = mazeSettingModal.querySelectorAll(
    ".mazeSettingModal_settingValue"
  ),
  mazeContainer = document.querySelector(".mazeContainer") as HTMLTableElement,
  modeShower = document.querySelector(".modeShower") as HTMLDivElement,
  mazeDownloader = document.querySelector(
    ".mazeDownloader"
  ) as HTMLDialogElement,
  downloadFileNameContainer = mazeDownloader.querySelector(
    ".nameContainer_fileName"
  ) as HTMLInputElement,
  downloadBtn = mazeDownloader.querySelector(
    ".mazeDownloader_downloadBtn"
  ) as HTMLButtonElement,
  downloadCancelBtn = mazeDownloader.querySelector(
    ".mazeDownloader_cancelBtn"
  ) as HTMLButtonElement;

class Maze {
  row: number;
  cell: number;
  startCoord: number[];
  destinationCoord: number[];
  constructor(
    row: number,
    cell: number,
    startCoord: number[],
    destinationCoord: number[]
  ) {
    this.row = row;
    this.cell = cell;
    this.startCoord = startCoord;
    this.destinationCoord = destinationCoord;
  }
}

let maze: Maze,
  mazeData: number[][][] = [],
  currentMode: "normal" | "drawLine" | "eraseLine" = "normal",
  previousCell: HTMLTableCellElement | null = null;

const downloadMazeDataFile = () => {
  const fileName = downloadFileNameContainer.value,
    a = document.createElement("a"),
    jsonFile = new File(
      [
        JSON.stringify({
          mazeData,
          startCoord: maze.startCoord,
          destinationCoord: maze.destinationCoord,
        }),
      ],
      `${fileName}.json`,
      {
        type: "application/json",
      }
    );
  a.href = URL.createObjectURL(jsonFile);
  a.download = `${fileName}.json`;
  a.click();
  mazeDownloader.style.display = "none";
  mazeDownloader.close();
};
const cancelDownload = () => {
  mazeDownloader.style.display = "none";
  mazeDownloader.close();
};
const clickKeyBoard = (event: KeyboardEvent) => {
  event.preventDefault();
  const key = event.key;
  if (key === "Control") {
    if (currentMode === "normal") {
      currentMode = "drawLine";
    } else if (currentMode === "drawLine") {
      currentMode = "eraseLine";
    } else if (currentMode === "eraseLine") {
      currentMode = "normal";
    }
    modeShower.innerText = currentMode;
    return;
  }
  if (key === "Enter") {
    mazeDownloader.style.display = "flex";
    mazeDownloader.showModal();
    downloadBtn.addEventListener("click", downloadMazeDataFile);
    downloadCancelBtn.addEventListener("click", cancelDownload);
  }
};
const eraseLine = (event: MouseEvent) => {
  if (currentMode !== "eraseLine") return;
  const target = event.currentTarget as HTMLTableCellElement;
  if (previousCell === null) {
    previousCell = target;
    return;
  }
  const mazeRow = target.parentNode as HTMLTableRowElement;
  if (target.previousElementSibling === previousCell) {
    mazeData[mazeRow.rowIndex][target.cellIndex - 1].splice(2, 1, 1);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(3, 1, 1);
    target.classList.add("leftAble");
    previousCell.classList.add("rightAble");
  } else if (target.nextElementSibling === previousCell) {
    mazeData[mazeRow.rowIndex][target.cellIndex + 1].splice(3, 1, 1);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(2, 1, 1);
    target.classList.add("rightAble");
    previousCell.classList.add("leftAble");
  } else if (
    mazeRow.previousElementSibling?.children[target.cellIndex] === previousCell
  ) {
    mazeData[mazeRow.rowIndex - 1][target.cellIndex].splice(0, 1, 1);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(1, 1, 1);
    target.classList.add("topAble");
    previousCell.classList.add("bottomAble");
  } else if (
    mazeRow.nextElementSibling?.children[target.cellIndex] === previousCell
  ) {
    mazeData[mazeRow.rowIndex + 1][target.cellIndex].splice(1, 1, 1);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(0, 1, 1);
    target.classList.add("bottomAble");
    previousCell.classList.add("topAble");
  }
  previousCell = target;
};
const drawLine = (event: MouseEvent) => {
  if (currentMode !== "drawLine") return;
  const target = event.currentTarget as HTMLTableCellElement;
  if (previousCell === null) {
    previousCell = target;
    return;
  }
  const mazeRow = target.parentNode as HTMLTableRowElement;
  if (target.previousElementSibling === previousCell) {
    mazeData[mazeRow.rowIndex][target.cellIndex - 1].splice(2, 1, 0);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(3, 1, 0);
    target.classList.remove("leftAble");
    previousCell.classList.remove("rightAble");
  } else if (target.nextElementSibling === previousCell) {
    mazeData[mazeRow.rowIndex][target.cellIndex + 1].splice(3, 1, 0);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(2, 1, 0);
    target.classList.remove("rightAble");
    previousCell.classList.remove("leftAble");
  } else if (
    mazeRow.previousElementSibling?.children[target.cellIndex] === previousCell
  ) {
    mazeData[mazeRow.rowIndex - 1][target.cellIndex].splice(0, 1, 0);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(1, 1, 0);
    target.classList.remove("topAble");
    previousCell.classList.remove("bottomAble");
  } else if (
    mazeRow.nextElementSibling?.children[target.cellIndex] === previousCell
  ) {
    mazeData[mazeRow.rowIndex + 1][target.cellIndex].splice(1, 1, 0);
    mazeData[mazeRow.rowIndex][target.cellIndex].splice(0, 1, 0);
    target.classList.remove("bottomAble");
    previousCell.classList.remove("topAble");
  }
  previousCell = target;
};
const drawMaze = () => {
  if (
    document.body.clientWidth <
    (maze.row / 20) * document.body.clientHeight
  ) {
    document.body.style.width = `${5 * maze.row}vh`;
  }
  if (maze.cell > 20) {
    document.body.style.height = `${5 * maze.cell}vh`;
  }
  const fragment = document.createDocumentFragment(),
    mazeBody = document.createElement("tbody");

  for (let i = 0; i < maze.row; i++) {
    const tr = document.createElement("tr"),
      mazeRow: number[][] = [];
    for (let j = 0; j < maze.cell; j++) {
      const td = document.createElement("td");
      td.classList.add("mazeRoom");
      td.addEventListener("mouseenter", eraseLine);
      td.addEventListener("mouseenter", drawLine);
      mazeRow.push([0, 0, 0, 0]);
      tr.append(td);
    }
    mazeData.push(mazeRow);
    mazeBody.append(tr);
  }
  mazeBody.children[maze.startCoord[0]].children[maze.startCoord[1]].id =
    "startPoint";
  mazeBody.children[maze.destinationCoord[0]].children[
    maze.destinationCoord[1]
  ].id = "endPoint";
  fragment.append(mazeBody);
  mazeContainer.append(fragment);
};
const setMaze = (event: SubmitEvent) => {
  event.preventDefault();
  const mazeSizeData: Array<number> = [],
    startCoordData: number[] = [],
    destinationCoordData: number[] = [];
  for (let i = 0; i < mazeSettingValueContainers.length; i++) {
    const valueContainer = mazeSettingValueContainers[i] as HTMLInputElement;
    if (i < 2) {
      mazeSizeData.push(
        isNaN(Number(valueContainer.value)) || Number(valueContainer.value) < 0
          ? 10
          : Math.floor(Number(valueContainer.value))
      );
    } else {
      [startCoordData, destinationCoordData][Math.floor((i - 2) / 2)].push(
        isNaN(Number(valueContainer.value)) || Number(valueContainer.value) < 0
          ? Math.floor((i - 2) / 2) === 0
            ? 0
            : (mazeSizeData[i - 4] as number)
          : Math.floor(Number(valueContainer.value))
      );
    }
  }
  maze = new Maze(
    mazeSizeData[0] as number,
    mazeSizeData[1] as number,
    startCoordData,
    destinationCoordData
  );
  drawMaze();
  window.addEventListener("keyup", clickKeyBoard);
  mazeSettingModal.style.display = "none";
  mazeSettingModal.close();
};
mazeSettingModal.showModal();
mazeSettingModal.addEventListener("submit", setMaze);
