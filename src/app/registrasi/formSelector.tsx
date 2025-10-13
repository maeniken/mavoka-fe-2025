'use client'

import FormSMK from './forms/formSiswa'
 import FormSekolah from './forms/formSekolah'
 import FormPerusahaan from './forms/formPerusahaan'
 import FormLembaga from './forms/formLembagaPelatihan'

type Props = {
  role: string
}

export default function FormSelector({ role }: Props) {
  switch (role) {
    case 'smk':
      return <FormSMK />
     case 'sekolah':
       return <FormSekolah />
     case 'perusahaan':
       return <FormPerusahaan />
     case 'lembaga':
       return <FormLembaga />
    default:
      return null
  }
}
