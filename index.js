const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const express=require("express")
const app=express()
const PORT = process.env.PORT || 3000;


const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });


app.get('/emails', async (req, res)=>{
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10
    });

    const messages = response.data.messages || [];

    const emails = [];

    for (let message of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: message.id
      });

      if (fullMessage.data.labelIds.indexOf('SENT') > -1) {
        continue;
      }

      const headers = fullMessage.data.payload.headers;
      const fromHeader = headers.find(h => h.name === 'From');
      const toHeader = headers.find(h => h.name === 'To');
      const subjectHeader = headers.find(h => h.name === 'Subject');

      emails.push({
        id: message.id,
        threadId: fullMessage.data.threadId,
        from: fromHeader.value,
        to: toHeader.value,
        subject: subjectHeader.value
      });
    }

    res.send(emails);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post('/emails/:id/labels/:name', async (req, res) => {
  const { id, name } = req.params;

  try {
    const response = await gmail.users.messages.modify({
      auth: oauth2Client,
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: [name],
      },
    });

    console.log('Label added to email: ', id);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.put('/emails/:id/labels/:name', async (req, res) => {
  const { id, name } = req.params;

  try {
    const response = await gmail.users.messages.modify({
      auth: oauth2Client,
      userId: 'me',
      id: id,
      resource: {
        addLabelIds: [name],
        removeLabelIds: ['INBOX'],
      },
    });

    console.log('Email moved to label: ', name);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});


// GET endpoint to retrieve all unread emails
app.get('/emails', async (req, res) => {
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults: 10
      });
  
      const messages = response.data.messages || [];
      const emails = [];
  
      for (const message of messages) {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id
        });
  
        if (fullMessage.data.labelIds.indexOf('SENT') > -1) {
          continue;
        }
  
        const headers = fullMessage.data.payload.headers;
        const fromHeader = headers.find(h => h.name === 'From');
        const toHeader = headers.find(h => h.name === 'To');
        const subjectHeader = headers.find(h => h.name === 'Subject');
  
        const email = {
          from: fromHeader.value,
          to: toHeader.value,
          subject: subjectHeader.value,
          date: new Date(fullMessage.data.internalDate),
          snippet: fullMessage.data.snippet,
          threadId: fullMessage.data.threadId,
          id: fullMessage.data.id
        };
  
        emails.push(email);
      }
  
      res.json(emails);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving emails');
    }
  });
  
  // POST endpoint to reply to an email
  app.post('/emails/:id/reply', async (req, res) => {
    const emailId = req.params.id;
    const { body } = req.body;
  
    try {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: emailId
      });
  
      const headers = fullMessage.data.payload.headers;
      const fromHeader = headers.find(h => h.name === 'From');
      const toHeader = headers.find(h => h.name === 'To');
      const subjectHeader = headers.find(h => h.name === 'Subject');
      const threadId = fullMessage.data.threadId;
  
      const rawMessage = `From: "Your Name" <your-email@gmail.com>\r\n` +
        `To: ${fromHeader.value}\r\n` +
        `Subject: Re: ${subjectHeader.value}\r\n` +
        `\r\n` +
        `${body}`;
  
      const res = await gmail.users.messages.send({
        auth: oauth2Client,
        userId: 'me',
        resource: {
          raw: Buffer.from(rawMessage).toString('base64'),
        },
        threadId: threadId,
      });
  
      res.json({ message: 'Reply sent successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Error sending reply');
    }
  });
  




app.listen(PORT, () => console.log(`Server started on port ${PORT}`));