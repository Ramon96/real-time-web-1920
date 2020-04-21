# Corona Social experiment.

<!-- Add a link to your live demo in Github Pages 🌐-->
## Link to live demo:
[Demo](https://rule-the-world.herokuapp.com/social)

<!-- ☝️ replace this description with a description of your own work -->
## Description
The idea is to test wether or not peole respect each others space, will people take distance or will they try to purpossly make each other sick. 

<!-- Add a nice image here at the end of the week, showing off your shiny frontend 📸 -->

<!-- Maybe a table of contents here? 📚 -->

<!-- How about a section that describes how to install this project? 🤓 -->
## Installation
Clone the project

```
git clone https://github.com/Ramon96/real-time-web-1920.git
```

Navigate in the right folder

```
cd /real-time-web-1920
```


Run the project

```
nodemon
```

<!-- ...but how does one use this project? What are its features 🤔 -->
## Features
### Moving around
The server keeps track of all player locations and allows players to move around using the *asdw* keys

```
io.emit('updatelocations', users)
```

### Infecting
(In progress)

<!-- What external data source is featured in your project and what are its properties 🌠 -->
## Api
Im currently using the [Covid19api](https://covid19api.com/)

I will be able to get the amount of cases, recovered and deceases from this api per country and I will use this data to make the experiment more extreme based on the amount of cases by chosen country.

<!-- This would be a good place for your data life cycle ♻️-->
## Data life cycle
![Datalifecycle](https://github.com/Ramon96/real-time-web-1920/blob/master/readme-resources/datading.png?raw=true)
<!-- Maybe a checklist of done stuff and stuff still on your wishlist? ✅ -->
## Wishlist
- [ ] Collition detection.
- [ ] Random decease when no one is sick.
- [ ] Single player experience.
- [ ] Rooms per country.
- [ ] Preventing players from walking outside the canvas
- [ ] scaling the canvas (or forcing a certain width
- [ ] Obstacles
- [ ] Oath, using your picture as your player pawn

<!-- How about a license here? 📜  -->
## License
[MIT](https://github.com/Ramon96/real-time-web-1920/blob/master/LICENSE)
