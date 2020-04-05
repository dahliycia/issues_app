const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || '/data'

const STATES = ['open', 'pending', 'closed']
const NEW_ISSUE_REQUIRED_FIELDS = ['title', 'description']
const STATE_UPDATE_REQUIRED_FIELDS = ['state']


const issueFileName = (id) => `${DATA_DIR}/${id}.json`

const issuesListHandler = async (request, h) => { 
  const { limit, offset } = request.query;

  const issuesList = fs.readdirSync(DATA_DIR).map((filename) => filename.replace('.json', ''));

  const data = issuesList.slice(offset, limit)
    .map((id) => getSingleIssueData(id))
  return data;
}

const getSingleIssueData = (id) => {
  let raw;
  try {
    raw = fs.readFileSync(issueFileName(id))
  } catch (err) {
    console.log(err)
    throw err;
  }
  const data = JSON.parse(raw);
  return data;
}

const issuesSingleHandler = async (request, h) => {
  const { id } = request.params;
  let data;
  try {
    data = getSingleIssueData(id) 
  } catch (err) {
    return Boom.badRequest('invalid issue id')
  }
  return data;
}

const getNewIssueNumber = () => { 
  console.log(DATA_DIR)
  const currentFiles = fs.readdirSync(DATA_DIR);
  const issueNumber = currentFiles.length
  if (issueNumber > 999) {
    return Boom.badRequest('Reached max number of issues: 1000');
  }
  return ("0000" + issueNumber).substr(-4,4);
}

const issuesAddHandler = async (request, h) => {
  const { payload } = request;
  var data = JSON.parse(payload);

  for (const field of NEW_ISSUE_REQUIRED_FIELDS) {
    if (data[field] === undefined) return Boom.badRequest(`The JSON body must contain: "${field}"`)
  }

  const id = getNewIssueNumber();
  data.id = id;
  data.state = 'open';
  data.comments = [];
  
  fs.writeFile(issueFileName(id), JSON.stringify(data), function (err) {
    if (err) return Boom.badImplementation('Failed to register new issue');
    console.log('Successfully registered issue: ' + id);
  });
  return {
    id: id
  }

}

const issuesStateChangeHandler = async (request, h) => {
  const { id } = request.params;
  const { payload } = request;
  const data = JSON.parse(payload);

  for (const field of STATE_UPDATE_REQUIRED_FIELDS) {
    if (data[field] === undefined) return Boom.badRequest(`The JSON body must contain: "${field}"`)
  }
  if (STATES.indexOf(data.state) === -1) { 
    return Boom.badRequest(`"state" must be one of the following: ${JSON.stringify(STATES)}`)
  }

  let currentData;
  try {
    currentData = getSingleIssueData(id)
  } catch (err) {
    return Boom.badRequest('invalid issue id')
  }

  const currentState = currentData.state;
  if (STATES.indexOf(currentState) >= STATES.indexOf(data.state)) {
    return Boom.badRequest(`cannot set the issue state from ${currentState} to ${data.state}`)
  }

  currentData.state = data.state;
  if (data.comment) {
    currentData.comments = currentData.comments || [];
    currentData.comments.push(data.comment);
  }

  fs.writeFile(issueFileName(id), JSON.stringify(currentData), function (err) {
    if (err) return Boom.badImplementation('Failed to update issue: ' + id);
    console.log('Successfully updated issue: ' + id);
  });

  return {
    id: id,
    state: currentData.state
  }
}

const routes = [
  {
    method: 'GET',
    path: '/issues',
    config: {
      handler: issuesListHandler,
      validate: {
        query: { 
          limit: Joi.number().default(10)
            .description('number of records to return'),
          offset: Joi.number().default(0)
            .description('offset of records to return')
          // Other functionalities to consider implementing here: 
          // sorting by: date, state; 
          // filtering by: state, submitter, assignee;
          // introducing tagging
          // search
        }
      },
      description: 'Return list of all issues'
    }
  },
  {
    method: 'GET',
    path: '/issues/{id}',
    config: {
      handler: issuesSingleHandler,
      validate: {
        params: { 
          id: Joi.string()
            .description('id of issue to return'),
        }
      },
      description: 'Return a single issue from API'
    }
  },
  {
    method: 'POST',
    path: '/issues/add',
    config: {
      handler: issuesAddHandler,
      description: 'Add a new issue. Payload should have a form of JSON with: {title: <string>, description: <string>}'
    }
  },
  {
    method: 'POST',
    path: '/issues/{id}/change_state',
    config: {
      handler: issuesStateChangeHandler,
      description: 'Change state of an existing issue. Payload should have a form of JSON with: {state: <string: pending/closed>, comment: <string>'
    }
  }
];

exports.routes = routes;