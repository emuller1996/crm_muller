/* eslint-disable prettier/prettier */

export const paginationComponentOptions = {
  rowsPerPageText: 'Filas por página',
  rangeSeparatorText: 'de',
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Todos',
}
export const genderOptions = [
  { label: 'Hombre', value: 'men' },
  { label: 'Mujer', value: 'women' },
  { label: 'Ninos', value: 'kid' },
]

export const StatusOrderOptions = [
  { label: 'Pendiente', value: 'Pendiente' },
  { label: 'En Proceso', value: 'En Proceso' },
  { label: 'En Camino', value: 'En Camino' },
  { label: 'Entregada', value: 'Entregada' },
  { label: 'Cancelada', value: 'Cancelada' },
]



export const stylesSelect = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? '#7977e6a2' : '#dbdfe6',
    boxShadow: state.isFocused
      ? '  rgba(0, 0, 0, 0.16) 0px 1px 4px, #4b49b642 0px 0px 0px 3px;'
      : '',
    borderRadius: '0.4em',
    backgroundColor: 'white',

  }),
  menu: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? 'grey' : 'red',
    backgroundColor: 'white',
  }),
}

export const themeSelect = {
  colors: {
    primary: '#4b49b688',
    primary25: '#7473ca',
    primary50: '#aeade6',
    primary75: '#dad9f7',
  },
}
