$(function () {
  let place = document.querySelector("#location");
  let input = document.querySelector("input");
  let button = document.querySelector("#searchBtn");
  let iconEls = document.querySelectorAll("li img");
  let timeEls = document.querySelectorAll("li p");
  let tempEls = document.querySelectorAll("li .temp");
  let regionBtns = document.querySelectorAll(".region-btns button");

  const ctx = document.getElementById("weatherChart");

  // API 키 및 차트 변수 전역 설정
  let APIkey = "2010d365e18b83b6ad2cae08969bed30";
  let chart;

  // 1. 현재 위치 기반으로 첫 화면 날씨 가져오기
  getLocation();

  function getLocation() {
    // 위치 허용 시 success 함수 실행 / 차단되거나 에러 발생 시 기본값으로 '서울' 날씨 출력
    navigator.geolocation.getCurrentPosition(success, () => {
      weather("Seoul");
      matchActiveButton("Seoul");
    });
  }

  async function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIkey}&units=metric&lang=kr`,
    );
    let data = await response.json();
    render(data);

    // 처음 GPS로 가져온 도시 이름에 맞춰 버튼에 자동으로 불 켜기
    matchActiveButton(data.city.name);
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

  // HTML의 onclick 속성 대응용 유지
  window.weather = weather;

  // 3. 지역 버튼 클릭 이벤트 (컬러 체인지 및 날씨 연동)
  regionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // 모든 버튼에서 active 클래스를 제거해서 불을 끕니다.
      regionBtns.forEach((b) => b.classList.remove("active"));

      // 방금 내가 클릭한 버튼에만 active 클래스를 붙여서 노란 불을 켭니다.
      this.classList.add("active");

      // 버튼에 적힌 텍스트를 읽어와 영어 도시명으로 변환 후 매칭합니다.
      let cityName = this.textContent.trim();
      if (cityName === "서울") weather("Seoul");
      else if (cityName === "부산") weather("Busan");
      else if (cityName === "인천") weather("Incheon");
      else if (cityName === "제주") weather("Jeju");
    });
  });

  // 4. 검색창 우측 SEARCH 버튼을 클릭했을 때
  button.addEventListener("click", () => {
    let city = input.value;
    if (city.trim() !== "") {
      weather(city);
      input.value = "";

      // 직접 검색 시 기존 지역 버튼들의 선택 불을 다 꺼줍니다.
      regionBtns.forEach((b) => b.classList.remove("active"));
    }
  });

  // 5. 검색창에서 엔터 키를 쳤을 때
  input.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      let city = input.value;
      if (city.trim() !== "") {
        weather(city);
        input.value = "";

        // 직접 검색 시 기존 지역 버튼들의 선택 불을 다 꺼줍니다.
        regionBtns.forEach((b) => b.classList.remove("active"));
      }
    }
  });
  // 6. 받아온 도시명(영어)을 판단해 해당 버튼에 불을 켜주는 함수
  function matchActiveButton(apiCityName) {
    regionBtns.forEach((b) => b.classList.remove("active")); // 일단 모두 끄기

    if (apiCityName.includes("Seoul")) {
      regionBtns.forEach((b) => {
        if (b.textContent.trim() === "서울") b.classList.add("active");
      });
    } else if (apiCityName.includes("Busan")) {
      regionBtns.forEach((b) => {
        if (b.textContent.trim() === "부산") b.classList.add("active");
      });
    } else if (apiCityName.includes("Incheon")) {
      regionBtns.forEach((b) => {
        if (b.textContent.trim() === "인천") b.classList.add("active");
      });
    } else if (apiCityName.includes("Jeju")) {
      regionBtns.forEach((b) => {
        if (b.textContent.trim() === "제주") b.classList.add("active");
      });
    } else {
      // 4개 외의 타 지역(부천, 대구 등)이거나 에러 시 기본값으로 '서울' 버튼에 불을 켭니다.
      regionBtns.forEach((b) => {
        if (b.textContent.trim() === "서울") b.classList.add("active");
      });
    }
  }

  // 7. 화면에 날씨 정보를 나타냄
  function render(data) {
    place.textContent = data.city.name;

    let topSection = document.querySelector(".top-section");
    let currentWeather = data.list[0].weather[0].main.toLowerCase();
    console.log("현재 날씨 기준:", currentWeather);

    if (currentWeather === "clear") {
      topSection.style.backgroundImage = "url('img/clear.jpg')";
    } else if (currentWeather === "clouds") {
      topSection.style.backgroundImage = "url('img/clouds.jpg')";
    } else if (currentWeather === "rain") {
      topSection.style.backgroundImage = "url('img/rainy.jpg')";
    } else if (currentWeather === "snow") {
      topSection.style.backgroundImage = "url('img/snow.jpg')";
    } else {
      topSection.style.backgroundImage = "url('img/clear.jpg')";
    }

    let temps = [];
    let labels = [];

    for (let i = 0; i < tempEls.length; i++) {
      let temp = Math.round(data.list[i].main.temp);
      tempEls[i].textContent = `${temp}℃`;

      let icon = data.list[i].weather[0].icon;
      let iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
      iconEls[i].src = iconUrl;

      let label = data.list[i].dt_txt.slice(11, 16);
      timeEls[i].textContent = label;

      temps.push(temp);
      labels.push(label);
    }

    drawChart(temps, labels);
  }

  // 8. 차트를 그리고 파괴하는 함수
  function drawChart(temps, labels) {
    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "시간별온도",
            data: temps,
            borderWidth: 2,
            borderColor: "#E1341E",
            backgroundColor: "rgba(225, 52, 30, 0.05)",
            tension: 0.2,
          },
        ],
      },
      options: {
        responsive: true,
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
              color: "#E1341E",
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
