const express = require("express");
const morgan = require("morgan");
const expressgraphql = require("express-graphql").graphqlHTTP;
var { buildSchema } = require("graphql");

// GraphQL schema
var schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic: String): [Course]
    },
    type Mutation {
        updateCourseTopic(id: Int!, topic: String!): Course
    }
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
`);

var coursesData = [
  {
    id: 1,
    title: "The Complete Node.js Developer Course",
    author: "Andrew Mead, Rob Percival",
    description:
      "Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!",
    topic: "Node.js",
    url: "https://codingthesmartway.com/courses/nodejs/",
  },
  {
    id: 2,
    title: "Node.js, Express & MongoDB Dev to Deployment",
    author: "Brad Traversy",
    description:
      "Learn by example building & deploying real-world Node.js applications from absolute scratch",
    topic: "Node.js",
    url: "https://codingthesmartway.com/courses/nodejs-express-mongodb/",
  },
  {
    id: 3,
    title: "JavaScript: Understanding The Weird Parts",
    author: "Anthony Alicea",
    description:
      "An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.",
    topic: "JavaScript",
    url: "https://codingthesmartway.com/courses/understand-javascript/",
  },
];

var getCourse = function (args) {
  var id = args.id;
  return coursesData.filter((course) => {
    return course.id == id;
  })[0];
};

var getCourses = function (args) {
  if (args.topic) {
    var topic = args.topic;
    return coursesData.filter((course) => course.topic === topic);
  } else {
    return coursesData;
  }
};

var updateCourseTopic = function ({ id, topic }) {
  coursesData.map((course) => {
    if (course.id === id) {
      course.topic = topic;
      return course;
    }
  });
  return coursesData.filter((course) => course.id === id)[0];
};

var root = {
  course: getCourse,
  courses: getCourses,
  updateCourseTopic: updateCourseTopic,
};

// Create an express server and a GraphQL endpoint
var app = express();
app.use(
  "/graphql",
  expressgraphql({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000, () =>
  console.log("Express GraphQL Server Now Running On localhost:4000/graphql")
);

// const app = express();
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello Express!");
});

// app.listen(8000, () => {
//   console.log("Express server is listening on port 8000!");
// });

app.get("/burgers", (req, res) => {
  res.send("We have juicy cheese burgers!");
});

app.get("/pizza/pepperoni", (req, res) => {
  res.send("Your pizza is on the way!");
});

app.get("/pizza/pineapple", (req, res) => {
  res.send("We don't serve that here. Never call again!");
});

app.get("/echo", (req, res) => {
  const responseText = `Here are some details of your request:
    Base URL: ${req.baseUrl}
    Host: ${req.hostname}
    Path: ${req.path}
  `;
  res.send(responseText);
});

app.get("/queryViewer", (req, res) => {
  console.log(req.query);
  res.end();
});

app.get("/greetings", (req, res) => {
  const name = req.query.name;
  const race = req.query.race;

  if (!name) {
    return res.status(400).send("please provide a name");
  }

  if (!race) {
    return res.status(400).send("please provide a race");
  }

  const greeting = `Greetings ${name} the ${race}, welcome to our kingdom.`;

  res.send(greeting);
});

app.get("/sum", (req, res) => {
  const a = parseInt(req.query.a, 10);
  const b = parseInt(req.query.b, 10);
  const c = a + b;

  if (!a) {
    return res.status(400).send("please provide an initial number");
  }

  if (!b) {
    return res.status(400).send("please provide an initial number");
  }

  const result = `The sum of ${a} and ${b} is ${c}.`;

  res.send(result);
});

// app.get("/cipher", (req, res) => {
//   const text = req.query.text;
//   const shift = req.query.shift;

//   if (!text) {
//     return res.status(400).send("text is required");
//   }

//   if (!shift) {
//     return res.status(400).send("shift is required");
//   }

//   const numShift = parseFloat(shift);

//   if (Number.isNaN(numShift)) {
//     return res.status(400).send("shift must be a number");
//   }

//   const base = "A".charCodeAt(0);

//   const cipher = text
//     .toUpperCase()
//     .split("")
//     .map((char) => {
//       const code = char.charCodeAt(0);

//       if (code < base || code > base + 26) {
//         return char;
//       }

//       let diff = code - base;
//       diff = diff + numShift;

//       diff = diff % 26;

//       const shiftedChar = String.fromCharCode(base + diff);
//       return shiftedChar;
//     })
//     .join("");

//   res.status(200).send(cipher);
// });

app.get("/lotto", (req, res) => {
  const numbers = req.query.numbers;

  if (!numbers) {
    return res.status(400).send("numbers is required");
  }

  if (!Array.isArray(numbers)) {
    return res.status(400).send("numbers must be an array");
  }

  const guesses = numbers
    .map((n) => parseInt(n))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 20);

  if (guesses.length != 6) {
    return res
      .status(400)
      .send("numbers must contain 6 integers between 1 and 20");
  }

  const stockNumbers = Array(20)
    .fill(1)
    .map((_, i) => i + 1);

  const winningNumbers = [];

  for (let i = 0; i < 6; i++) {
    const ran = Math.floor(Math.random() * stockNumbers.length);
    winningNumbers.push(stockNumbers[ran]);
    stockNumbers.splice(ran, 1);
  }

  let diff = winningNumbers.filter((n) => !guesses.includes(n));

  let responseText;

  switch (diff.length) {
    case 0:
      responseText = "Wow! Unbelievable! You could have won the mega millions!";
      break;
    case 1:
      responseText = "Congratulations! You win $100!";
      break;
    case 2:
      responseText = "Congratulations, you win a free ticket!";
      break;
    default:
      responseText = "Sorry, you lose";
  }

  res.send(responseText);
});

app.get("/hello", (req, res) => {
  res.status(204).end();
});

app.get("/video", (req, res) => {
  const video = {
    title: "Cats falling over",
    description: "15 minutes of hilarious fun as cats fall over",
    length: "15.40",
  };
  res.json(video);
});

app.get("/colors", (req, res) => {
  const colors = [
    {
      name: "red",
      rgb: "FF0000",
    },
    {
      name: "green",
      rgb: "00FF00",
    },
    {
      name: "blue",
      rgb: "0000FF",
    },
  ];
  res.json(colors);
});

app.get("/cipher", (req, res) => {
  const text = "B";
  const shift = 2;

  if (!text) {
    return res.status(400).send("text is required");
  }

  if (!shift) {
    return res.status(400).send("shift is required");
  }

  if (typeof text !== "string") {
    return res.status(400).send("text must be a string");
  }

  const numShift = parseFloat(shift);

  if (Number.isNaN(numShift)) {
    return res.status(400).send("shift must be a number");
  }

  const base = "A".charCodeAt(0);

  const cipher = text
    .toUpperCase()
    .split("")
    .map((char) => {
      code = char.charCodeAt(0);

      if (code < base || code > base + 26) {
        return char;
      }

      let diff = code - base;
      diff = diff + numShift;
      diff = diff % 26;
      const shiftedChar = String.fromCharCode(base + diff);
      return shiftedChar;
    })
    .join("");

  return res.status(201).send(`${cipher}`);
});
