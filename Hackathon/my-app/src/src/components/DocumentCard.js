import React from 'react';
import { Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const DocumentCard = ({ doc, onDelete }) => (
  <Card className="rounded-xl shadow-sm">
    <CardContent>
      <div className="flex justify-between items-center">
        <Typography variant="h6" noWrap>
          {doc.filename}
        </Typography>
        <Tooltip title="Delete Document">
          <IconButton
            onClick={onDelete}
            color="error"
            aria-label={`Delete document ${doc.filename}`}
            size="large"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </div>
      <Typography variant="body2" color="text.secondary">
        Uploaded: {new Date(doc.createdAt).toLocaleString()}
      </Typography>
    </CardContent>
  </Card>
);

export default DocumentCard;
