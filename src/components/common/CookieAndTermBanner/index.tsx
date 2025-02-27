import { useEffect, type ReactElement } from 'react'
import classnames from 'classnames'
import type { CheckboxProps } from '@mui/material'
import { Grid, Button, Checkbox, FormControlLabel, Typography, Paper, SvgIcon, Box } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { useForm } from 'react-hook-form'
import { metadata } from '@/markdown/terms/terms.md'

import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCookies,
  CookieAndTermType,
  saveCookieAndTermConsent,
  hasAcceptedTerms,
} from '@/store/cookiesAndTermsSlice'
import { selectCookieBanner, openCookieBanner, closeCookieBanner } from '@/store/popupSlice'

import css from './styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'

const COOKIE_AND_TERM_WARNING: Record<CookieAndTermType, string> = {
  [CookieAndTermType.TERMS]: '',
  [CookieAndTermType.NECESSARY]: '',
  [CookieAndTermType.UPDATES]: `You attempted to open the "What's new" section but need to accept the "Beamer" cookies first.`,
  [CookieAndTermType.ANALYTICS]: '',
}

const CookieCheckbox = ({
  checkboxProps,
  label,
  checked,
}: {
  label: string
  checked: boolean
  checkboxProps: CheckboxProps
}) => <FormControlLabel label={label} checked={checked} control={<Checkbox {...checkboxProps} />} sx={{ mt: '-9px' }} />

export const CookieAndTermBanner = ({
  warningKey,
  inverted,
}: {
  warningKey?: CookieAndTermType
  inverted?: boolean
}): ReactElement => {
  const warning = warningKey ? COOKIE_AND_TERM_WARNING[warningKey] : undefined
  const dispatch = useAppDispatch()
  const cookies = useAppSelector(selectCookies)

  const { getValues, setValue } = useForm({
    defaultValues: {
      [CookieAndTermType.TERMS]: true,
      [CookieAndTermType.NECESSARY]: true,
      [CookieAndTermType.UPDATES]: cookies[CookieAndTermType.UPDATES] ?? false,
      [CookieAndTermType.ANALYTICS]: cookies[CookieAndTermType.ANALYTICS] ?? false,
      ...(warningKey ? { [warningKey]: true } : {}),
    },
  })

  const handleAccept = () => {
    const values = getValues()
    dispatch(
      saveCookieAndTermConsent({
        ...values,
        termsVersion: metadata.version,
      }),
    )
    dispatch(closeCookieBanner())
  }

  const handleAcceptAll = () => {
    setValue(CookieAndTermType.UPDATES, true)
    setValue(CookieAndTermType.ANALYTICS, true)
    setTimeout(handleAccept, 300)
  }

  return (
    <Paper className={classnames(css.container, { [css.inverted]: inverted })}>
      {warning && (
        <Typography align="center" mb={2} color="warning.background" variant="body2">
          <SvgIcon component={WarningIcon} inheritViewBox fontSize="small" color="error" sx={{ mb: -0.4 }} /> {warning}
        </Typography>
      )}

      <form>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="body2" mb={2}>
              By browsing this page, you accept our{' '}
              <Link href={AppRoutes.terms} style={{ textDecoration: 'underline' }}>
                Terms & Conditions
              </Link>{' '}
              (last updated October 2024) and the use of necessary cookies.{' '}
              <Link href={AppRoutes.cookie} style={{ textDecoration: 'underline' }}>
                Cookie policy
              </Link>
              .
            </Typography>

            <Grid container alignItems="center" gap={4}>
              <Grid item xs={12} sm>
                <Box mb={2}>
                  <CookieCheckbox checkboxProps={{ id: 'necessary', disabled: true }} label="Necessary" checked />
                  <br />
                  <Typography variant="body2">Locally stored data for core functionality</Typography>
                </Box>
              </Grid>
            </Grid>

            <Grid container alignItems="center" justifyContent="center" mt={4} gap={2}>
              <Grid item>
                <Typography>
                  <Button onClick={handleAccept} variant="text" size="small" color="inherit" disableElevation>
                    Save settings
                  </Button>
                </Typography>
              </Grid>

              <Grid item>
                <Button onClick={handleAcceptAll} variant="contained" color="secondary" size="small" disableElevation>
                  Accept all
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

const CookieBannerPopup = (): ReactElement | null => {
  const cookiePopup = useAppSelector(selectCookieBanner)
  const dispatch = useAppDispatch()

  const hasAccepted = useAppSelector(hasAcceptedTerms)
  const shouldOpen = !hasAccepted

  useEffect(() => {
    if (shouldOpen) {
      dispatch(openCookieBanner({}))
    } else {
      dispatch(closeCookieBanner())
    }
  }, [dispatch, shouldOpen])

  return cookiePopup.open ? (
    <div className={css.popup}>
      <CookieAndTermBanner warningKey={cookiePopup.warningKey} inverted />
    </div>
  ) : null
}
export default CookieBannerPopup
