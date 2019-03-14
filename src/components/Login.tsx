import React, { PureComponent } from "react";
import { Query } from "react-apollo";
import { gql } from "apollo-boost";
import { MeQuery } from "../schemaTypes";
import { Link } from "react-router-dom";
// import { Link } from "react-router-dom";

const meQuery = gql`
  query MeQuery {
    me {
      userName
      email
      id
    }
  }
`;

const userItemsStyle = {
  marginRight: "2rem"
};

class Login extends PureComponent {
  render() {
    return (
      <Query<MeQuery> query={meQuery}>
        {({ data, loading }) => {
          if (loading) {
            return null;
          }
          if (!data) {
            return (
              <div>
                <li>
                  <Link to="/login" style={userItemsStyle}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" style={userItemsStyle}>
                    Register
                  </Link>
                </li>
              </div>
            );
          } else {
            return <div>&nbsp;&nbsp;&nbsp; Welcome {data.me.userName}</div>;
          }
        }}
      </Query>
    );
  }
}

export default Login;