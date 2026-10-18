/**
 * Account controls — one component for the whole connected/disconnected pair.
 *
 * The address, its copy button, and Disconnect used to be three loose siblings
 * in the header row, which read as three unrelated items. As one bordered
 * cluster they say what they are: this is the account area. CopyField keeps
 * its own behaviour (truncated display, full value on focus and hover, a copy
 * button that confirms in place, and an explorer link only when one can be
 * built for real).
 *
 * Nothing here is a "wallet balance": the balance needs a verified SDK method
 * this build does not have, and StudioNet is gasless, so 0 GEN is expected and
 * must not be warned about. A write that fails for lack of funds surfaces the
 * faucet link in its own error instead.
 */

import { useWallet } from "@/genlayer/WalletProvider";
import { t } from "@/i18n";
import { CopyField } from "./CopyField";

export function AccountPill() {
  const wallet = useWallet();

  if (!wallet.isConnected || !wallet.address) {
    return (
      <div className="account account--disconnected">
        <button
          type="button"
          className="btn btn--quiet btn--small"
          onClick={() => void wallet.connect()}
          disabled={!wallet.hasProvider}
        >
          {wallet.hasProvider ? t("wallet.connect") : t("wallet.none")}
        </button>
      </div>
    );
  }

  return (
    <div className="account">
      <CopyField value={wallet.address} kind="address" label={t("wallet.address_label")} />
      <span className="account__rule" aria-hidden="true" />
      <button type="button" className="account__action" onClick={wallet.disconnect}>
        {t("wallet.disconnect")}
      </button>
    </div>
  );
}

export default AccountPill;
