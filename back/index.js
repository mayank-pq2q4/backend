const express = require('express')
const app = express()
const path = require('path')
const { v4: uuid } = require("uuid"); 
const { eventNames } = require('process')
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
//to handle json data
app.use(express.json());

const bookedEntries = [
    {
        id: uuid(),
        date: '21-01-01',
        event: 'NEW year!!!!',
        eventDescription: '',
        timeFrom: '00:00',
        timeTo: '23:59',
        place: 'Courtyard'
    },
    {
        id: uuid(),
        date: '21-3-4',
        event: 'Holi !!!!',
        eventDescription: 'Happy Holi friends!!',
        timeFrom: '00:00',
        timeTo: '23:59',
        place: 'Courtyard'
    },
    {
        id: uuid(),
        date: '21-1-31',
        event: 'Enigma event!!!!',
        eventDescription: '2 day Hackathon!',
        timeFrom:'16:00',
        timeTo: '17:00',
        place: "LH1"
    },
    {
        id: uuid(),
        date: '21-1-31',
        event: 'Mayank\'s poolgame time!',
        eventDescription: 'Me n my friends playing at this time.',
        timeFrom: '00:00',
        timeTo: '23:59',
        place: '8ball pool room'
    }
]

const laundryTimeLeft = {
    days: 4,
    hours: 6,
    minutes:21
}

function checkAvailability(scheduleRequest) {

    for(let entries of bookedEntries){
        if (scheduleRequest.date === entries.date) {
            console.log("Same date:", entries.event)
            let hourFrom = parseInt(scheduleRequest.timeFrom.slice(0,2));
            let hourFromE = parseInt(entries.timeFrom.slice(0,2));

            let hourToE = parseInt(entries.timeTo.slice(0,2));
            // let minFrom = parseInt(scheduleRequest.timeFrom.slice(3,6));
            // let minFromE = parseInt(entries.timeFrom.slice(3,6));

            let hourTo = parseInt(scheduleRequest.timeTo.slice(0,2));
            // let minTo = parseInt(scheduleRequest.timeTo.slice(3,6));
            // let minToE = parseInt(entries.timeTo.slice(3,6));

            let dn = scheduleRequest.timeFrom.slice(-2);
            if ((hourFrom > hourFromE && hourFrom < hourToE) || (hourTo > hourFromE && hourTo < hourToE)) {
                //its btw the scheduled time at the same placei e, they clash
                if (scheduleRequest.place === entries.place) {
                    console.log("CLASSSH!!!", );
                    return entries.id;
                }
            }
        }

    }
    return false;

}
app.get('/', (req, res) => {
    res.render('home')
});
app.get('/schedule', (req, res) => {
    res.render('schedule/index', {bookedEntries})
});

app.get('/laundry', (req, res) => {
    res.render('laundry/index', {laundryTimeLeft})
});

app.get("/schedule/new", (req, res) => {
    res.render("schedule/new");
});

app.get("/schedule/:id", (req, res) => {
    const { id } = req.params;
    const bookedEntry = bookedEntries.find((e) => e.id === id); 
    res.render("schedule/view", {bookedEntry});
});

app.get("/schedule/sorry/:id", (req,res) => {
    const { id } = req.params;
    res.render("schedule/sorry", {id});
});
//, {bookedEntry: bookedEntry}
app.post("/schedule", (req, res) => {
    const { date, event, eventDescription, timeFrom, timeTo, place } = req.body;
    let schedule = { date: date, event: event, eventDescription: eventDescription, timeFrom: timeFrom, timeTo: timeTo, place: place, id: uuid()}
    let getClashId = checkAvailability(schedule)
    if (!getClashId) {
        bookedEntries.push(schedule);
        res.redirect("/schedule");
    }
    else {
        res.redirect("/schedule/sorry/" + getClashId) //, {getClashId: getClashId});
    }
    //after accomplishing a task, it redirects us and sends a default get request to the comments route
});

app.listen(3000, () => {console.log('listening on port 3000')});