const Foo = () => {
  return <div>Foo</div>;
};

export default Foo;

export async function getStaticProps() {
  const foo = await getTweets(['935857414435495937']);
  console.log(foo);

  return { props: { foo } };
}
