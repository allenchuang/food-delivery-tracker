import React, { Component } from "react";
import clsx from 'clsx';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { mainListItems, secondaryListItems } from './dashboard/listItems';
import Chart from './dashboard/Chart';
import Deposits from './dashboard/Deposits';
import Orders from './dashboard/Orders';
import socketIOClient from "socket.io-client";

const ACTIVE_EVENTS = ['CREATED', 'COOKED', 'DRIVER_RECEIVED'];
const INACTIVE_EVENTS = [ 'CANCELLED', 'DELIVERED' ];


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'. Built with '}
      <Link color="inherit" href="https://material-ui.com/">
        Material-UI.
      </Link>
    </Typography>
  );
}

const drawerWidth = 240;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
});
class App extends Component {

  constructor() {
    super();
    this.state = {
      response: [],
      activeOrders: [],
      inactiveOrders: [],
      endpoint: "http://127.0.0.1:4001",
      timeElapsed: 0,
      navOpen: true,
    };
  }
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("FromAPI", (data, sec) => {
      this.sortFeed(data, sec);
    });    
  }

  handleDrawerOpen = () => {
    this.setState({ ...this.state, navOpen: true});
  };

  handleDrawerClose = () => {
    this.setState({ ...this.state, navOpen: false});
  };

  changeStatus = (id, order) => {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    // console.log(predicted_details);
    socket.emit("Status Change", id,  order);
  };

  filterByCreated = (arr) => {
    return arr.filter( order => order.event_name === 'CREATED');
  }

  filterByCooked = (arr,s) => {
    const { timeElapsed } = this.state;
    let minSec = timeElapsed - s;
    return arr.filter( order => order.event_name === 'COOKED' && (minSec < order.sent_at_second < timeElapsed) );
  }

  findIndex = (arr, id) => {
    return arr.findIndex(order => order.id === id);    
    // return list.some( order => order.id  === id);
  }

  sortFeed = async (data, sec) => {
    const {activeOrders, inactiveOrders, response} = this.state;

    // let newFeed = await [...data].concat(feed);    

    // console.log(feed);
    data.forEach( order => {
      // Save active / inactive
      let inactiveFound =  this.findIndex(inactiveOrders,order.id);
      let activeFound =  this.findIndex(activeOrders,order.id);
      console.log('sortFeed....')
      console.log(inactiveFound, activeFound);
      if ( ACTIVE_EVENTS.includes(order.event_name)) {
        // add new order / update existing order
        if (activeFound === -1) {
          activeOrders.push(order);
        } else {
          activeOrders[activeFound] = order;
        }
      } else if ( INACTIVE_EVENTS.includes(order.event_name)) {
        // add to inactive orders and remove from active orders
        if (inactiveFound === -1 && activeFound > -1) {
          // delete activeOrders[order.id];
          activeOrders.splice(activeFound,1);
          inactiveOrders.push(order);
          // inactiveOrders[order.id] = order;
        } else {
          // do something
        }
      }
    });

    let feed = await [...response].concat(...data);
    await feed.sort( (a,b) =>  b.sent_at_second - a.sent_at_second);

    this.setState({ response: response.concat(...data), activeOrders: activeOrders.sort( (a,b) =>  b.sent_at_second - a.sent_at_second), inactiveOrders: inactiveOrders.sort( (a,b) =>  b.sent_at_second - a.sent_at_second), timeElapsed: sec});
  }
  
  render() {
    const { classes } = this.props;
    const { response, activeOrders, inactiveOrders, timeElapsed, navOpen} = this.state;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    // const feed = response.reverse();
    
    // const feed = response ? response.map( (e) => {
    //     return (
    //     <div key={`${e.id}-${e.event_name}-${e.sent_at_second}`}>
    //       <div>{e.id}</div>
    //       <div>{e.name}</div>
    //       <div>{e.event_name}</div>
    //       <div>{e.destination}</div>
    //       <div>{e.sent_at_second}</div>         
    //     </div>
    //     )}) : '';
    

    const activeList = activeOrders ? activeOrders.map( (e) => {
      return (
        <div key={`${e.id}-${e.event_name}-${e.sent_at_second}`}>
          <p>Order Id: {e.id}</p>
          <p>Order Item: {e.name}</p>
          <p>Status: {e.event_name}</p>
          <p>Destination: {e.destination}</p>
          <p>TimeStamp: {e.sent_at_second}</p>
        </div>
      )}) : '';

    const inactiveList = inactiveOrders ? inactiveOrders.map( (e) => {
      return (
        <div key={`${e.id}-${e.event_name}-${e.sent_at_second}`}>
          <p>Order Id: {e.id}</p>
          <p>Order Item: {e.name}</p>
          <p>Status: {e.event_name}</p>
          <p>Destination: {e.destination}</p>
          <p>TimeStamp: {e.sent_at_second}</p>
      </div>
      )}) : '';

      return (
        <div className={classes.root}>
          <CssBaseline />
          <AppBar position="absolute" className={clsx(classes.appBar, navOpen && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={clsx(classes.menuButton, navOpen && classes.menuButtonHidden)}
              >
                <MenuIcon />
              </IconButton>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                Dashboard
              </Typography>
              <IconButton color="inherit">
                <Badge badgeContent={4} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !navOpen && classes.drawerPaperClose),
            }}
            open={navOpen}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={this.handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>{mainListItems}</List>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="false" className={classes.container}>
              <Grid container spacing={3}>
                {/* Chart */}
                {/* <Grid item xs={12} md={8} lg={9}>
                  <Paper className={fixedHeightPaper}>
                    <Chart />
                  </Paper>
                </Grid> */}
                {/* Recent Deposits */}
                {/* <Grid item xs={12} md={4} lg={3}>
                  <Paper className={fixedHeightPaper}>
                    <Deposits />
                  </Paper>
                </Grid> */}
                {/* Active List */}
                <Grid item xs={12} md={6}>
                  <Paper className={classes.paper}>
                    <Orders title='Active Orders' feed={activeOrders} />
                  </Paper>
                </Grid>
                {/* Inactive List */}
                <Grid item xs={12} md={6}>
                  <Paper className={classes.paper}>
                    <Orders title='Inactive Orders' feed={inactiveOrders} />
                  </Paper>
                </Grid>
                {/* Recent Orders */}
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <Orders title='Order History' feed={response} />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
            <Copyright />
          </main>
        </div>
      );      
      // return (
      //   <React.Fragment>
      //     <div>Time Elapsed: {timeElapsed} seconds </div>
      //     <h1>Feed</h1>
      //       <div>
      //         {feed}
      //       </div>
      //     <hr/>
      //     <h2>Active</h2>
      //       <div>
      //         {activeList}
      //       </div>
      //     <h2>Inactive</h2>
      //       <div>
      //         {inactiveList}
      //       </div>
      //   </React.Fragment>
      // )

      // return <Dashboard/>

      
  };  
}
export default withStyles(styles)(App);