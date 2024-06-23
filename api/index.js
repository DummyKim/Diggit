// index.js

const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = 5500; // 포트를 5500으로 변경

// CORS 설정
app.use(cors());

// JSON 파싱 설정
app.use(express.json());

// 엑셀 파일 경로
const excelFilePath = path.join(__dirname, 'items.xlsx');

// 엑셀 파일을 읽어서 확률 및 데이터를 가져오는 함수
const getExcelData = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // K열 확률 값 읽기
    const probabilities = [
        sheet['K2'] ? parseFloat(sheet['K2'].v) : 0,
        sheet['K3'] ? parseFloat(sheet['K3'].v) : 0,
        sheet['K4'] ? parseFloat(sheet['K4'].v) : 0,
        sheet['K5'] ? parseFloat(sheet['K5'].v) : 0,
        sheet['K6'] ? parseFloat(sheet['K6'].v) : 0
    ];

    // 전체 데이터 읽기
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    return { data, probabilities };
};

// 확률에 따라 id를 선택하는 함수
const selectRandomId = (data, probabilities) => {
    const weightedData = [];

    for (let i = 1; i < data.length; i++) {
        const bValue = data[i][1]; // B열의 값
        const probability = probabilities[bValue - 1];
        for (let j = 0; j < probability; j++) {
            weightedData.push(data[i][0]); // A열의 값
        }
    }

    const randomIndex = Math.floor(Math.random() * weightedData.length);
    return weightedData[randomIndex];
};

// ID와 일치하는 행을 찾고, 결과 배열을 생성하는 함수
const getResult = (id, data) => {
    for (let i = 1; i < data.length; i++) { // 첫 행은 헤더이므로 1부터 시작
        if (data[i][0] === id) {
            return [data[i][0], data[i][1], data[i][2], data[i][4]];
        }
    }
    return null;
};

// API 엔드포인트 설정
app.get('/api/generate-id', (req, res) => {
    try {
        const { data, probabilities } = getExcelData(excelFilePath);
        const id = selectRandomId(data, probabilities);
        console.log(`Generated ID: ${id}`);
        const result = getResult(id, data);

        if (result) {
            console.log(`Result: ${JSON.stringify(result)}`);
            res.json({ id, result });
        } else {
            console.error(`ID ${id} not found in the Excel file`);
            res.status(404).send(`ID ${id} not found in the Excel file`);
        }
    } catch (error) {
        console.error('Error generating ID:', error);
        res.status(500).send('Error generating ID');
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
