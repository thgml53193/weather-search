$(function () {
  let place = document.querySelector("#location");
  let input = document.querySelector("input");
  let button = document.querySelector("#searchBtn");
  let iconEls = document.querySelectorAll("li img");
  let timeEls = document.querySelectorAll("li p");
  let tempEls = document.querySelectorAll("li .temp");

  const ctx = document.getElementById("weatherChart");

  // API 키 및 차트 변수 전역 설정
  let APIkey = "2010d365e18b83b6ad2cae08969bed30";
  let chart;

  // 1. 현재 위치 기반으로 첫 화면 날씨 가져오기
  getLocation();

  function getLocation() {
    navigator.geolocation.getCurrentPosition(success);
  }

  async function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`,
    );
    let data = await response.json();
    render(data);
  }

  // 2. 도시 검색 및 지역 버튼 클릭용 weather 함수 정의
  async function weather(city) {
    try {
      let response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIkey}&units=metric&lang=kr`,
      );
      if (!response.ok) throw new Error("도시를 찾을 수 없습니다.");
      let data = await response.json();
      render(data);
    } catch (error) {
      alert(error.message);
    }
  }

  // ✨ [핵심 추가] HTML의 onclick="weather(...)" 버튼들이 이 함수를 찾을 수 있도록 전역(window)에 등록합니다.
  window.weather = weather;

  // 버튼을 클릭했을 때
  button.addEventListener("click", () => {
    let city = input.value;
    if (city.trim() !== "") {
      weather(city);
      input.value = "";
    }
  });

  // 검색창에서 엔터쳤을 때
  input.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      let city = input.value;
      if (city.trim() !== "") {
        weather(city);
        input.value = "";
      }
    }
  });

  // 화면에 날씨 정보를 나타냄
  function render(data) {
    place.textContent = data.city.name;

    // 1. 상단 섹션(이미지가 바뀔 대상)을 선택합니다.
    let topSection = document.querySelector(".top-section");

    // 2. 3시간 단위 리스트 중 가장 첫 번째(현재 시각과 가장 가까운 예보) 날씨를 읽어옵니다.
    let currentWeather = data.list[0].weather[0].main.toLowerCase();
    console.log("현재 날씨 기준:", currentWeather);

    // 3. 날씨에 맞춰 상단 배경 이미지 주소를 실시간으로 변경합니다.
    if (currentWeather === "clear") {
      topSection.style.backgroundImage = "url('img/clear.jpg')";
    } else if (currentWeather === "clouds") {
      // ☁️ 흐림: 안개가 은은하게 끼거나 숲 위에 흐린 구름이 덮인 차분한 사진
      topSection.style.backgroundImage = "url('img/clouds.jpg')";
    } else if (currentWeather === "rain") {
      topSection.style.backgroundImage = "url('img/rainy.jpg')";
    } else if (currentWeather === "snow") {
      // ❄️ 눈: 침엽수림 위에 하얀 눈이 소복하게 쌓인 고즈넉한 겨울 사진
      topSection.style.backgroundImage = "url('img/snow.jpg')";
    } else {
      // 혹시 모를 기타 날씨(안개 등)가 오면 기본 맑음(숲) 이미지로 대처!
      topSection.style.backgroundImage = "url('img/clear.jpg')";
    }

    let temps = [];
    let labels = [];

    // HTML 카드 7개 채우기 반복문
    for (let i = 0; i < tempEls.length; i++) {
      // 온도
      let temp = Math.round(data.list[i].main.temp);
      tempEls[i].textContent = `${temp}℃`;

      // 아이콘
      let icon = data.list[i].weather[0].icon;
      let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
      iconEls[i].src = iconUrl;

      // 시간
      let label = data.list[i].dt_txt.slice(11, 16);
      timeEls[i].textContent = label;

      // 배열에 차곡차곡 쌓기
      temps.push(temp);
      labels.push(label);
    }

    // 데이터 7개가 다 모인 후, drawChart를 딱 한 번만 호출!
    drawChart(temps, labels);
  }

  // 차트를 그리고 파괴하는 함수
  function drawChart(temps, labels) {
    if (chart) {
      chart.destroy(); // 기존 차트가 있으면 완전히 지우기
    }

    // 새 차트 그리기
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "시간별온도",
            data: temps,
            borderWidth: 2, // 선 두께를 살짝 올려 가시성을 높였습니다.
            borderColor: "#E1341E", // 포인트 메인 컬러 (레드오렌지)
            backgroundColor: "rgba(225, 52, 30, 0.05)", // 부드러운 배경색 채우기
            tension: 0.2, // 선을 살짝 둥글게 만들어 감각적인 느낌 추가
          },
        ],
      },
      options: {
        responsive: true, // 반응형 유지 (부모 container 박스로 크기 조절 추천)
        scales: {
          y: {
            min: 10,
            max: 40,
            ticks: {
              stepSize: 5,
            },
            title: {
              display: true,
              text: "온도",
              color: "#E1341E", // 타이틀 컬러 통일
              font: { size: 13, weight: "bold" },
            },
          },
        },
        layout: {
          padding: {
            left: 30,
          },
        },
      },
    });
  }
});
