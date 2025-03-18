import { createVuetify } from 'vuetify'
import {
  VAlert,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VDialog,
  VBtn,
  VIcon,
  VOverlay,
  VSnackbar
} from 'vuetify/lib/components/index.mjs'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'


const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi', // Set MDI (Material Design Icons) as the default icon set
    aliases,
    sets: { mdi }
  },
  components: {
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VDialog,
    VBtn,
    VAlert,
    VIcon,
    VOverlay,
    VSnackbar
  },
})
export default vuetify
