import React, { useState, useEffect, KeyboardEvent, useRef } from "react";

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
      text: "",
    },
  ]);

  // 컴포지션 상태를 저장하는 상태를 추가 - 한글이 입력되는 상황
  const [isComposing, setIsComposing] = useState(false);

  const textBoxRefs = useRef<(HTMLDivElement | null)[]>([]); // DOM에서 요소가 제거되면 null을 줌

  useEffect(() => {
    textBoxRefs.current = textBoxRefs.current.slice(0, textBox.length);
  }, [textBox]);

  const setTextInput = (e: KeyboardEvent, idx: number) => {

    // 컴포지션 진행 중인 상태에서는 키 입력 이벤트를 무시
    if (isComposing) return;

    const targetInnerText = (e.target as HTMLDivElement).innerText; // 타켓 텍스트
    const selectedText = window.getSelection()?.toString(); // 현재 선택된(블록되어 있는) 텍스트
    
    // 입력 이벤트 완료 후로 미루기
    setTimeout(() => {

      if (e.key === " ") {
        const targetInnerText = (e.target as HTMLDivElement).innerText; // 입력 이후로 초기화 
        const cursorPosition = window.getSelection()?.anchorOffset || 0; // 현재 커서의 위치를 가져옴
        const mark = targetInnerText.substring(0, cursorPosition-1);
        const remainingText = targetInnerText.substring(cursorPosition);
        const remainingHTML = remainingText.replace(/ /g, "&nbsp;"); // 공백 문자를 &nbsp;로 바꿔줌

        // 공백이 mark의 바로 뒤에 위치하고 커서 또한 그 위치에 있는 경우에만 스타일 변경
        if (mark === "#") {
          (e.target as HTMLDivElement).innerHTML = remainingHTML;
          const newTextBox = [...textBox];
          newTextBox[idx].style = markdownStyle.h1;
          setTextBox(newTextBox);
        } else if (mark === "##") {
          (e.target as HTMLDivElement).innerHTML = remainingHTML;
          const newTextBox = [...textBox];
          newTextBox[idx].style = markdownStyle.h2;
          setTextBox(newTextBox);
        }
        textBox[idx].text = (e.target as HTMLDivElement).innerText;
      }
    }, 0);


    
    // 마지막 텍스트 박스에 입력이 있다면, 새로운 박스를 마지막에 추가
    if (idx === textBox.length - 1 && e.key !== "Backspace") {
      setTextBox([...textBox, { style: markdownStyle.text, text: "" }]);
    }

    // 텍스트 박스가 비어 있을 때, "백스페이스"가 눌리면, 해당 텍스트 박스를 제거
    if (selectedText === "" && idx !== textBox.length - 1 && e.key === "Backspace" && targetInnerText === "") {
      e.preventDefault(); // 포커싱 이동후 글자가 삭제되는 것을 막음
      const newTextBox = textBox.filter((_, filterIdx) => filterIdx !== idx);
      setTextBox(newTextBox);

      // 삭제된 텍스트 박스의 이전 박스로 포커싱을 이동
      if (idx > 0 && textBoxRefs.current[idx - 1]) {
        const previousTextBox = textBoxRefs.current[idx - 1];
        const range = document.createRange();
        const sel = window.getSelection();
        if (previousTextBox && sel) {

          range.setStart(previousTextBox, previousTextBox.childNodes.length);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          previousTextBox.focus();
        }
      }
    }

    // 텍스트 박스 안에서 'Enter' 키를 누르면 바로 아래에 새로운 텍스트 박스를 추가
    if (e.key === "Enter") {
      e.preventDefault(); // 'Enter' 키를 눌렀을 때의 기본 동작 (줄바꿈)을 막음
      const newTextBox = [...textBox];
      // 현재 텍스트 박스 다음에 새로운 텍스트 박스를 추가
      newTextBox.splice(idx + 1, 0, { style: markdownStyle.text, text: "" });
      setTextBox(newTextBox);
      // Next event loop에서 focus를 이동합니다.
      setTimeout(() => {
        textBoxRefs.current[idx + 1]?.focus();
      }, 0);
    }

  };

  // 컴포지션 시작 이벤트 처리 함수
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // 컴포지션 종료 이벤트 처리 함수
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);

    // 한글 입력 커서 핸들링
    const el = e.target as HTMLDivElement;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(el, el.childNodes.length);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
};
  
  return (
    <div>
      {textBox.map((value, idx) => {
        return (
          <div
            key={`textbox-${idx}`}
            style={value.style}
            onKeyDown={(e: KeyboardEvent) => setTextInput(e, idx)}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={(e: React.CompositionEvent<HTMLDivElement>) => handleCompositionEnd(e)}
            contentEditable
            tabIndex={0}  // div가 포커싱 가능하게 하려면 추가해야함
            ref={(el) => textBoxRefs.current[idx] = el}  // el이 해당 인덱스의 HTMLDivElement
          >
            {value.text}
          </div>
        );
      })}
    </div>
  );
}

export default App;