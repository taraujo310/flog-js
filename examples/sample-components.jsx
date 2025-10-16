function UserCard({ user }) {
  return (
    <div>
      {user.active ? <ActiveBadge /> : <InactiveBadge />}
      {user.premium && <PremiumIcon />}
      <h2>{user.name}</h2>
    </div>
  );
}

function ProductList({ products }) {
  return (
    <div>
      {products.map(product => (
        <ProductItem 
          key={product.id} 
          product={product}
          onSelect={() => handleSelect(product)}
        />
      ))}
    </div>
  );
}

const DashboardWidget = ({ data }) => {
  return (
    <div>
      {data.loading ? (
        <Spinner />
      ) : data.error ? (
        <ErrorMessage error={data.error} />
      ) : (
        <DataTable data={data.items} />
      )}
      {data.items && data.items.map(item => (
        <Row key={item.id}>
          {item.active && <Icon name="check" />}
          {item.status === 'pending' ? <Badge>Pending</Badge> : null}
        </Row>
      ))}
    </div>
  );
};

function helperFn() {
  if (true) {
    console.log('not a component');
  }
}
