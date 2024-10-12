"use client";

const Swap = () => {
  const mypackage = process.env.NEXT_PUBLIC_PACKAGE_ADDRESS as string;
  const network = process.env.NEXT_PUBLIC_NETWORK;
  // const { data: pool } = usePool(network, mypackage);
  return (
    <div>
      Exchange $RHEC and $RGAS
      <p>{mypackage}</p>
      <p>{network}</p>
      <h1>Here You can Swap $RHEC and $RGAS, it will Coming Soon !!!</h1>
    </div>
  );
};

export default Swap;
