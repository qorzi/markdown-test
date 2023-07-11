import React, { useState } from "react";

function App() {
  const markdownStyle = {
    h1: {
      fontSize: "2rem",
      fontWeight: "bold",
      padding: "2rem 1rem",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      padding: "1.5rem 1rem",
    },
    text: {
      fontSize: "1rem",
      fontWeight: "normal",
      padding: "1rem 1rem",
    },
  };

  const [textBox, setTextBox] = useState([
    {
      style: markdownStyle.text,
      text: "abc",
    },
    {
      style: markdownStyle.text,
      text: "def",
    },
  ]);

  const setTextInput = (e: React.KeyboardEvent, idx: number) => {
    const targetInnerText = (e.target as HTMLDivElement).innerText;
    const spaceIdx = targetInnerText.indexOf(" ");
    if (e.key === " ") {
      const mark = targetInnerText.substring(0, spaceIdx);
      if (mark == "#") {
        (e.target as HTMLDivElement).innerText = targetInnerText.substring(
          spaceIdx + 1
        );
        const newTextBox = [...textBox];
        newTextBox[idx].style = markdownStyle.h1;
        setTextBox(newTextBox);
      } else if (mark == "##") {
        (e.target as HTMLDivElement).innerText = targetInnerText.substring(
          spaceIdx + 1
        );
        const newTextBox = [...textBox];
        newTextBox[idx].style = markdownStyle.h2;
        setTextBox(newTextBox);
      }
    } else if (e.key === "Backspace" && textBox[idx].text === targetInnerText) {
      const newTextBox = [...textBox];
      newTextBox[idx].style = markdownStyle.text;
      setTextBox(newTextBox);
    }
    textBox[idx].text = (e.target as HTMLDivElement).innerText;
  };

  return (
    <div>
      {textBox.map((value, idx) => {
        return (
          <div
            key={`textbox-${idx}`}
            style={value.style}
            onKeyUp={(e: React.KeyboardEvent) => setTextInput(e, idx)}
            contentEditable
          >
            {value.text}
          </div>
        );
      })}
    </div>
  );
}

export default App;
