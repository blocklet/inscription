import PropTypes from 'prop-types';
import { Card, CardContent } from '@mui/material';

function QuoteComponent({ children, ...rest }) {
  return (
    <Card {...rest}>
      <CardContent className="!pt-4 !pb-4">{children}</CardContent>
    </Card>
  );
}

QuoteComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default QuoteComponent;
