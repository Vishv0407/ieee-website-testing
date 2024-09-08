async function fetchEvents() {
    const response = await fetch('https://ieee-vishv.onrender.com/api/events');
    const events = await response.json();
    const timelineList = document.querySelector('.timeline');

    // Sort events by date in ascending order
    events.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));

    // Add the events to the timeline
    events.forEach(event => {
        const eventDate = new Date(event.eventDate);
        const dateString = eventDate.getDate().toString().padStart(2, '0') + '-' + (eventDate.getMonth() + 1).toString().padStart(2, '0') + '-' + eventDate.getFullYear();

        const eventCard = document.createElement('li');
        eventCard.classList.add('timeline-event');

        // const eventSocialMediaLink = event.instaPostLink;

        let cardContent = `
        <div class="event-card">
            <img src="${event.eventPoster}" alt="${event.eventName} Poster">
            <div class="event-card-details">
                <h3>${event.eventName}</h3>
                <p>${event.eventDescription.length > 100 ? event.eventDescription.substring(0, 100) + '...' : event.eventDescription}</p>
                `;
            
            if(event.startTime === event.endTime){
                cardContent += `<p><span style="font-weight:600">Time: </span> ${event.startTime}</p>`
            }
            else{
                cardContent += `<p><span style="font-weight:600">Time: </span> ${event.startTime} - ${event.endTime}</p>`
            }

            cardContent += `
                <p><span style="font-weight:600">Speaker: </span>${event.speaker}</p>
                <p><span style="font-weight:600">Veneu: </span>${event.venue}</p>
                <button class="know-more" onclick="openModal(&quot;${event.eventName}&quot;, &quot;${encodeURIComponent(event.eventDescription.replace(/\n/g, '\\n').replace(/"/g, '\\"'))}&quot;, &quot;${event.eventPoster}&quot;, &quot;${event.speaker}&quot;, &quot;${dateString}&quot;, &quot;${event.startTime}&quot;, &quot;${event.endTime}&quot;, &quot;${event.venue}&quot;, &quot;${event.instaPostLink}&quot;)">Know More</button>

            </div>
        </div>
        <div class="event-date">${dateString}</div>
    `;

        eventCard.innerHTML = cardContent;
        timelineList.appendChild(eventCard);
    });
}

function openModal(eventName, eventDescription, eventPoster, speaker, eventDate, startTime, endTime, venue, instaPostLink) {
    document.getElementById('modalEventName').innerText = eventName;
    document.getElementById('modalEventImage').src = `${eventPoster}`;
    document.getElementById('modalEventDescription').innerText = decodeURIComponent(eventDescription).replace(/\\n/g, '\n');
    document.getElementById('modalSpeaker').innerText = speaker;
    document.getElementById('modalEventDate').innerText = eventDate;

    if(startTime === endTime){
        document.getElementById('modalEventTime').innerText = startTime;
    }
    else{
        document.getElementById('modalEventTime').innerText = startTime + ' - ' + endTime;
    }
    document.getElementById('modalVenue').innerText = venue;
    document.getElementById('modalInstaPost').href = instaPostLink;

    document.getElementById('eventModal').style.display = 'flex';
}

document.getElementById('modalClose').onclick = function () {
    document.getElementById('eventModal').style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == document.getElementById('eventModal')) {
        document.getElementById('eventModal').style.display = 'none';
    }
}

fetchEvents();