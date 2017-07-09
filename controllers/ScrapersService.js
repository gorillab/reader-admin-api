export const upload = (req, res) => {
  const examples = {};
  examples['application/json'] = {
    message: 'aeiou',
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
};

export const register = (req, res) => {
  const examples = {};
  examples['application/json'] = {
    apiUrl: 'aeiou',
    name: 'aeiou',
    id: 'aeiou',
    source: {
      id: 'aeiou',
      title: 'aeiou',
      url: 'aeiou',
    },
    frequency: 'aeiou',
  };
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
};
