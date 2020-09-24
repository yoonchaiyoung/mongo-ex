// Express 모듈
const express = require("express"); // 미들웨어
const http = require('http');       // 실제 http 기능 수행

// 몽고DB 모듈
const { MongoClient } = require("mongodb");

// Express 객체 생성
const app = express();
// set 메서드 : 익스프레스 내부에 여러 값을 설정(주로 설정)
app.set('port', 3000);  // port 키로 3000을 사용

// 정적 파일의 제공
// express의 static을 맵의 미들웨어로 등록
app.use(express.static(__dirname + "/public"));
// -> public 디렉토리를 정적파일 저장소로 활용

// 뷰엔진 설정
app.set("view engine", "ejs");  // 뷰 엔진 설정
app.set("views", __dirname + "/views"); // 템플릿의 위치 설정




// 요청 처리
app.get("/", (req, resp) => {
    console.log("[GET] / :")
    // http 모듈의 전송 방식
    /*
    resp.writeHead(200,
        {"Content-Type": 'text/html;charset=UTF8'});    // 헤더 전송
    resp.write("Express Welcomes You!");
    resp.end(); // 응답 전송
    */
   // express의 응답 방식 : 좀 더 유연
   resp.status(200)     // 상태 코드 전송
        .header("Content-Type", "text/html;charset=UTF8")   // 헤더 전송
        .send("Express Welcomes You!");
});

// GET 요청 파라미터의 처리 : URL Query String 처리
// url?key1=val1&key2=val2
app.get("/query", (req, resp) => {
    console.log("[GET] /query :", req.query);
    // name 파라미터 수신
    let name = req.query.name;

    if (name === undefined || name.length == 0) {
        resp.status(404)    // Not Found
            .contentType("text/plain;charset=URF8")
            .send("이름을 확인할 수 없어요.");
    } else {
    resp.status(200)
    .contentType("text/plain;charset=UTF8")
    .send("Name:" + name);
    }
});

//  URL 파라미터의 처리 : Pretty URL or Fancy URL
//  요청 데이터를 query가 아닌 url path의 일부로 전송하는 방식
//  /urlparam/이름
app.get("/urlparam/:name", (req, resp) => {
    console.log(req.params);

    let name = req.params.name;
    if (name != undefined) {
        
        // resp.status(200)
        //     .contentType("text/html;charset=utf8")
        //     .send("<h1>Name:" + name + "</h1>")
        //     .send("<p>URL 파라미터로 전달 받았습니다.</p>");
        resp.writeHead(200, 
            {"Content-Type": 'text/html;charset=UTF8'});
        resp.write("<h1>Name:" + name + "</h1>");
        resp.write("<p>URL 파라미터로 전달 받았습니다.</p>");
        resp.send();
    } else {
        resp.status(404)
            .contentType("text/html;charset=utf8")
            .send("<p>name URL 파라미터를 확인할 수 없습니다.</p>");
    }
});

// 뷰 엔진을 이용한 템플릿 렌더링
app.get("/render", (req, resp) => {
    resp.status(200)
        .contentType("text/html;charset=UTF8")
        .render("render");  // render.ejs 템플릿을 렌더링
})

// 라우터 등록(미들웨어)
const webRouter = require("./router/web")(app);
app.use("/web", webRouter);     // 요청이 /web/* -> 라우터가 처리

function startExpress() {
    // 실제 실행은 express가 아니라 http 모듈이 수행
    http.createServer(app).listen(app.get("port"), () => {
        console.log("Web Server is running on port ", app.get("port"));
    });
}
// startExpress(); // 익스프레스 실행

function startServer() {
    // 데이터베이스 연결
    const url = "mongodb://192.168.1.138:27017";

    MongoClient.connect(url, { useUnifiedTopology: true })
               .then(client => {
                   // 접속 성공시
                   const db = client.db("mydb");
                   console.log("db", db);   // db정보
                   // express app에 몽고DB 커넥션 세팅
                   app.set("db", db);

                   startExpress();
               }).catch(err => {
                   console.error(err);
               });
}
startServer();