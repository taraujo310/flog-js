import { useState, useEffect, useContext } from 'react';

function ComplexComponent({ items, config }) {
  const [state, setState] = useState(null);
  const theme = useContext(ThemeContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        setState(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => {
      console.log('cleanup');
    };
  }, [config.apiUrl]);

  useEffect(() => {
    if (state && state.ready) {
      processData(state);
    }
  }, [state]);

  return (
    <div className={theme.container}>
      {!state ? (
        <Loading />
      ) : (
        <div>
          {state.error && <ErrorMessage error={state.error} />}
          
          {items.map(item => (
            <div key={item.id}>
              {item.visible && (
                <ItemCard 
                  item={item}
                  onClick={() => handleClick(item)}
                  style={{ color: item.urgent ? 'red' : 'black' }}
                />
              )}
            </div>
          ))}

          {state.hasMore && (
            <button onClick={loadMore}>
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SimpleComponent() {
  return <div>Simple</div>;
}

export { ComplexComponent, SimpleComponent };
