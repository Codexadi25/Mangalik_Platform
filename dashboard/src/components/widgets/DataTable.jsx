import { DataGrid } from "@mui/x-data-grid";
import { Paper } from "@mui/material";

/** Generic data table widget reused across every role's listing pages. */
const DataTable = ({ rows, columns, loading }) => (
  <Paper sx={{ height: 520 }}>
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      getRowId={(row) => row._id || row.id}
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      disableRowSelectionOnClick
    />
  </Paper>
);

export default DataTable;
