# Cracker - Issues Tracker API

## ROUTES

### POST /issues/add

Add a new issue. Payload should have a form of: '
Payload:
```
{
  title: <string>, 
  description: <string>, 
  submitter: <string>
}
```

Example response:
```
{ "id": "0000" }
```


### GET /version

Return version of the API. Can be used as a healthcheck.

Example response:
```
{ "version": 0.1.0 }
```

### GET /issues

Return list of all issues

Query parameters:
```
  limit: (default: 10) - number of records to return
  offset: (default: 0) - offset of records to return
```

Example response:
```
{
  "data": [
    {
      "title": "test1",
      "submitter": "dahliycia",
      "description": "this is a test issue",
      "id": "0000",
      "state": "pending",
      "comments": [
        {
          "author": "dahl",
          "text": "update"
        }
      ]
    }
  ],
  "total": 1
}
```

### GET /issues/{id}

Return a single issue

Example response:
```
{
  "title": "test1",
  "submitter": "dahliycia",
  "description": "this is a test issue",
  "id": "0000",
  "state": "pending",
  "comments": [
    {
      "author": "dahl",
      "text": "update"
    }
  ]
}
}
```

### POST /issues/{id}/change_state

Change state of an existing issue. 

Payload:
```
{
  state: <string: pending/closed>, 
  comment: {
    author: <string>, 
    text: <string>
    }
}
```

Example response:
```
{
  "id": "0000",
  "status": "pending"
}
```
