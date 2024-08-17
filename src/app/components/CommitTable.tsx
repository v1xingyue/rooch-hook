const CommitTable = () => {
  const commits: any[] = [];
  return (
    <table>
      <tr>
        <td>Commit time </td>
        <td>Commit url </td>
        <td>Commit message </td>
        <td>Commit repo_url </td>
        <td>Commit username </td>
      </tr>
      {commits &&
        commits.map((commit) => {
          let decode_value = commit.state.decoded_value.value.value.value;
          return (
            <tr key={commit.field_key}>
              <td>{decode_value.commit_time}</td>
              <td>{decode_value.commit_url}</td>
              <td>{decode_value.message}</td>
              <td>{decode_value.repo_url}</td>
              <td>{decode_value.commit_user}</td>
            </tr>
          );
        })}
    </table>
  );
};
export default CommitTable;
