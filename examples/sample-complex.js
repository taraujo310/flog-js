function complexFunction(data) {
  if (!data) {
    throw new Error('Data required');
  }

  try {
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'special') {
        while (data[i].processing) {
          if (data[i].status === 'pending') {
            switch (data[i].priority) {
              case 'high':
                processHigh(data[i]);
                break;
              case 'medium':
                processMedium(data[i]);
                break;
              default:
                processLow(data[i]);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
    return null;
  }

  return data.filter(item => item.processed)
    .map(item => item.result)
    .reduce((acc, val) => acc + val, 0);
}

async function asyncComplexFunction(ids) {
  const results = [];
  
  for (const id of ids) {
    try {
      const data = await fetchData(id);
      
      if (data && data.valid) {
        const processed = data.items
          ? data.items.map(item => transformItem(item))
          : [];
        
        results.push(...processed);
      }
    } catch (err) {
      console.warn(`Failed to process ${id}:`, err);
      continue;
    }
  }
  
  return results.length > 0 ? results : null;
}

function simpleFunction() {
  return 'simple';
}
