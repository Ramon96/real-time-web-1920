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
The Api requires no key and documentation can be read [here](https://documenter.getpostman.com/view/10808728/SzS8rjbc)

I will be able to get
* the amount of cases
* total recovered
* total deceased

I will use the data per country and increase / decrease the difficulty based om the amount of cases.

<!-- This would be a good place for your data life cycle ♻️-->
## Data life cycle
![Datalifecycle](https://github.com/Ramon96/real-time-web-1920/blob/master/readme-resources/datading.png?raw=true)

## Socket events
### Greet
When the user is greeted he/her is given an socket id and his/hers dot will be made and he will be given a random location on the canvas, this location will be send to the server and finally the user will be added to the userlist.

### Adduser
When another user joins the scene all the other already online users will be notified there is someone new. The new user will be placed on his/hers location.

### updatelocations
When the user move around their x and y coordinates will change. When they do so the coordinates will be send to the server and send to all users and updated accordingly.

### Disconnect 
When an user is disconnected, that user will be removed from the userlist and the canvas will be redrawn without that user.

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
