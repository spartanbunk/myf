
Technologies to be used:
Vue.js
Docker
Node.js and Express server with a simple API.
PostgresSQL db   
You should never use typescript and always opt for the simplest most easy way to maintain and scale.
GoogleMaps API for advanced marker functionality.
Stripe for payment processing.
Redis for caching and session management.
Firebase for authentication.

Functionality:

The app is called Markyourfish.com and the premise behind the app is to allow users to use GoogleMaps advance marker functionality to click on a map and mark a fish. 
When a user marks a fish by clicking on the and the app takes those coordinates and opens the Log Catch modal. 
Then the user can enter the following fields. Species, depth, water temp, length,weight, lure type,photo and a place for notes. The species select list should contain the following fish.

Musky
Pike
Bass(Smallmouth)
Bass(Largemouth)
Walleye
Perch
Bluegill
Catfish
Trout 
Salmon
Other

When a user chooses other the user should get a text box to log the species.

The lure type select list should contain the following lures.
Bucktail
Spoon
Topwater
Crankbait 
Spinnerbait
Jig
Swimbait
Soft Plastic
Drop Shot
Rapala
Rattle Trap
Live Bait
Other
When a user chooses other the user should get a text box to log the lure type.

In addition to the coordinates, the app should also capture the following information when the user click the Save button in the log catch modal:
- The current weather conditions at the time of marking the fish (national weather service API)
---include these fields in the Log Catch modal:
Actual time of catch
Date of catch
Weather Conditions (Sunny, Cloudy, Rainy, etc.)
Wind Speed (in mph)
Wind Direction (N, NE, E, SE, S, SW, W, NW)
Air Temperature (in Fahrenheit)
Lunar Phase (New Moon, Full Moon, etc.)
Barometric Pressure (in inHg) and whether it is rising, falling or steady.

The app should also allow users to view their marked fish in a list format, with the ability to filter by species, date, and location.
The app should also allow users to upload a photo of the fish they caught.
The app should also allow users to view their marked fish on a map, with the ability to filter by species and date.
Each species should have a unique map pin color


Debugging and Development Guidelines:

- Always use Vue.js for the frontend.
- Always use the latest version of Vue.js and its ecosystem.
- Use Docker for containerization and development environment setup.
- Use Docker Compose for managing multi-container applications.
- Use Node.js with Express for the backend API.
- Use PostgreSQL for the database.
- Use Redis for caching and session management.
- Use Firebase for authentication.
- Use Google Maps API for advanced marker functionality.
- Use Stripe for payment processing.
- Use tailwindcss for styling and responsive design should be clean, modular, and maintainable.
 

- Always use the latest stable versions of libraries and frameworks.
- Always use the latest version of Docker and Docker Compose.
- Always use the latest version of PostgreSQL.
- Always use the latest version of Redis.
- Always use the latest version of Firebase.
- Always use the latest version of Google Maps API. -Advanced Marker functionality.
- Always use the latest version of Stripe API.
- Always use the latest version of Vue.js and its ecosystem.
- Always use the latest version of Node.js and Express.
- Always use the latest version of tailwindcss.
- Always use the latest version of bcrypt for password hashing.
- Always use the latest version of dotenv for environment variable management.  

- App should be mobile optimized.
- Always use responsive design principles.
- Always put md files, readme doc etc in a docs folder
- Never use emojis in the code or on the site. 
- Keep your console logs to the minimum.. Only enough to get your fix the issue and clean them up after we are done with a bug fix or feature. 

- Never use TypeScript (use vanilla JavaScript only)
- Always use Docker Compose down/up and npx kill for process management
- Never change ports - always run on port 3000
- Always kill processes or restart containers instead of changing ports
- Remember there was a bcrypt password hash corruption issue due to PostgreSQL escaping problems
- Keep persisting as a React master who can solve anything
- Always make the git setup easy to understand and maintain. I need a clear way to move from development to production with a readme file explaining the setup and deployment process.



Folder structure should be as follows:

my-app/
├── client/                          # Vue.js frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── styles/
│   │   │   │   ├── main.css
│   │   │   │   └── variables.css
│   │   │   └── fonts/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   └── Sidebar.vue
│   │   │   ├── ui/
│   │   │   │   ├── Button.vue
│   │   │   │   ├── Input.vue
│   │   │   │   └── Modal.vue
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   └── SignupForm.vue
│   │   │   ├── maps/
│   │   │   │   ├── GoogleMap.vue
│   │   │   │   └── MapMarker.vue
│   │   │   └── payments/
│   │   │       ├── CheckoutForm.vue
│   │   │       └── PaymentSuccess.vue
│   │   ├── views/
│   │   │   ├── Home.vue
│   │   │   ├── About.vue
│   │   │   ├── Contact.vue
│   │   │   ├── Login.vue
│   │   │   ├── Dashboard.vue
│   │   │   └── Checkout.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── composables/
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useMaps.js
│   │   │   └── usePayments.js
│   │   ├── services/
│   │   │   ├── firebase.js
│   │   │   ├── api.js
│   │   │   ├── maps.js
│   │   │   └── stripe.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── server/                          # Node.js/Express backend
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── payments.js
│   │   └── maps.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── cors.js
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── firebase.js
│   ├── models/
│   │   ├── User.js
│   │   └── Payment.js
│   ├── utils/
│   │   └── helpers.js
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── database/                        # PostgreSQL setup
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   └── 002_create_payments.sql
│   ├── seeds/
│   │   └── initial_data.sql
│   └── init.sql
├── docker/                          # Docker configuration
│   ├── client.Dockerfile
│   ├── server.Dockerfile
│   └── postgres.Dockerfile
├── docs/                           # All documentation
│   ├── README.md
│   ├── SETUP.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── RULES.md
├── docker-compose.yml
├── .env.example
└── README.md



