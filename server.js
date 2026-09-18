import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import OpenAI from "openai";

/**
 *
 * 1. express: 서버개발을 쉽게 해주는 라이브러리 집합체
 * 2. openai: openai API 사용을 위한 패키지
 * 3. dotenv: 보안적으로 중요한 값을 .env파일로 따로 관리할수 있도록 하는 패키지
 * 4. cors: CORS정책으로 서로 다른 출처라도 데이터 통신할수 있게 만들어주는 패키지
 */

// Express 애플리케이션 객체 생성
const app = express();

// 환경변수 로드
dotenv.config();

// cors 설정
app.use(cors());

// Json 설정
// 프론트엔드에서 받은 Json형태의 데이터를 자바스크립트 객체로 파싱(변환)하여 사용
app.use(express.json()); // for parsing application/jso
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// openai 설정
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatTest = async () => {
  try {
    // 제대로 실행될때 구문
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: "오늘 날씨가 어때?",
        },
      ],
    });
    console.log("🚀 response:", response.choices[0].message);
  } catch (error) {
    // try에서 에러났을때 처리할 구문
    console.log(error);
  }
};

// 챗봇 api설정
const initialMessage = (ingredientList) => {
  return [
    {
      role: "system",
      content: `당신은 "맛있는 쉐프"라는 이름의 전문 요리사입니다. 사용자가 재료 목록을 제공하면, 첫번째 답변에서는 오직 다음 문장만을 응답으로 제공해야 합니다. 다른 어떤 정보도 추가하지 마세요: 제공해주신 재료 목록을 보니 정말 맛있는 요리를 만들 수 있을 것 같아요. 어떤 종류의 요리를 선호하시나요? 간단한 한끼 식사, 특별한 저녁 메뉴, 아니면 가벼운 간식 등 구체적인 선호도가 있으시다면 말씀해 주세요. 그에 맞춰 최고의 레시피를 제안해 드리겠습니다!`,
    },
    {
      role: "user",
      content: `안녕하세요, 맛있는 쉐프님. 제가 가진 재료로 요리를 하고 싶은데 도와주실 수 있나요? 제 냉장고에 있는 재료들은 다음과 같아요: ${ingredientList
        .map((item) => item.value)
        .join(", ")}`,
    },
  ];
};

// 초기 답변
app.post("/recipe", async (req, res) => {
  const { ingredientList } = req.body; // 재료 목록

  // openai에게 보낼 메시지 배열
  const messages = initialMessage(ingredientList);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = [...messages, response.choices[0].message];
    console.log("data", data);

    // 프론트엔드에게 응답
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 유저와의 채팅
app.post("/message", async (req, res) => {
  const { userMessage, messages } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [...messages, userMessage],
      temperature: 1,
      max_tokens: 4000,
      top_p: 1,
    });
    const data = response.choices[0].message;

    // 프론트엔드에게 응답
    res.json({ data });
  } catch (error) {
    console.log(error);
  }
});

// 서버 실행
app.listen(8080, () => {
  console.log("서버 ON");
  // chatTest();
});
