import PropTypes from 'prop-types';
import { ListItem, Typography, IconButton, ListItemText, ListItemAvatar, List } from '@mui/material';

function QuoteComponent({ children, index, explorerUrl, createdAt, ...rest }) {
  return (
    <List {...rest}>
      <ListItem
        alignItems="center"
        sx={{
          paddingTop: 0,
          paddingBottom: 0,
        }}>
        <ListItemAvatar>
          <IconButton
            sx={{
              width: 40,
              height: 40,
            }}
            href={explorerUrl}
            target="_blank"
            color="primary"
            size="small">
            {index}
          </IconButton>
        </ListItemAvatar>
        <ListItemText
          sx={{
            marginTop: 0,
            marginBottom: 0,
          }}
          primary={
            <Typography sx={{ display: 'inline' }} component="span" variant="body1" color="text.primary">
              {children}
            </Typography>
          }
          secondary={<div className="mt-0.25">{createdAt}</div>}
        />
      </ListItem>
    </List>
  );
}

QuoteComponent.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.any,
  explorerUrl: PropTypes.string,
  createdAt: PropTypes.string,
};

QuoteComponent.defaultProps = {
  index: null,
  explorerUrl: null,
  createdAt: null,
};

export default QuoteComponent;
