/* eslint-disable no-script-url */

import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from './Title';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}
const useStyles = makeStyles(theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function Orders(props) {
  const classes = useStyles();
  console.log(props);
  const { feed, title, filterBy } = props;

  return (
    <div style={{minHeight: '300px'}}>
      <Title>{title}</Title>
      {/* <div onClick={filterBy('CREATED')}>Filter Created</div> */}
      {feed.length > 0 ? <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Item Name</TableCell>
            <TableCell>Status</TableCell>
            <TableCell style={{width:'20px'}}>TimeStamp</TableCell>
            <TableCell align="right">Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody stripedRows>
          {feed.map(row => (
            <TableRow key={`${row.id}-${row.name}-${row.sent_at_second}`}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.event_name}</TableCell>
              <TableCell>{row.sent_at_second}</TableCell>
              <TableCell align="right">{row.destination}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> :
    
        <div>No orders in queue</div>
    
      }
      
      {/* <div className={classes.seeMore}>
        <Link color="primary" href="javascript:;">
          See more orders
        </Link>
      </div> */}
    </div>
  );
}
