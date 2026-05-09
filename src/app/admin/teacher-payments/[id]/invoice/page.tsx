import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/shared/PrintButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherPaymentVoucherPage({ params }: Props) {
  const { id } = await params;
  const paymentId = parseInt(id, 10);
  if (Number.isNaN(paymentId)) notFound();

  const [payment, settingsRows] = await Promise.all([
    prisma.teacherPayment.findUnique({
      where: { id: paymentId },
      include: { teacher: { include: { user: true } } },
    }),
    prisma.setting.findMany(),
  ]);
  if (!payment) notFound();

  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value || "";

  const voucherNumber = `TPV-${String(payment.id).padStart(6, "0")}`;

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-print-area, .invoice-print-area * { visibility: visible; }
          .invoice-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 24px !important; box-shadow: none !important; border: none !important;
          }
          .no-print { display: none !important; }
          @page { margin: 12mm; }
        }
      `}</style>

      <div className="flex items-center justify-between no-print">
        <Link href="/admin/teacher-payments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teacher Payments
        </Link>
        <PrintButton label="Print Voucher" />
      </div>

      <div className="invoice-print-area bg-white max-w-3xl mx-auto rounded-xl border border-gray-200 p-10 shadow-sm">
        <header className="flex items-start justify-between border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start gap-4">
            {settings.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt="" className="w-14 h-14 object-contain rounded" />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-sans">{settings.site_name || "Mastermoosai Institute"}</h1>
              {settings.site_tagline && <p className="text-sm text-gray-500">{settings.site_tagline}</p>}
              {settings.address && <p className="text-xs text-gray-500 mt-1">{settings.address}</p>}
              {(settings.phone || settings.email) && (
                <p className="text-xs text-gray-500">
                  {settings.phone}
                  {settings.phone && settings.email ? " · " : ""}
                  {settings.email}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-500">Payment Voucher</p>
            <p className="text-lg font-bold text-gray-900">{voucherNumber}</p>
            <p className="text-xs text-gray-500 mt-1">Issued {formatDate(payment.paymentDate)}</p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Paid To</p>
            <p className="text-sm font-semibold text-gray-900">{payment.teacher.user.name}</p>
            <p className="text-xs text-gray-500">{payment.teacher.specialization}</p>
            <p className="text-xs text-gray-500">{payment.teacher.user.email}</p>
            {payment.teacher.user.phone && (
              <p className="text-xs text-gray-500">{payment.teacher.user.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Status</p>
            {payment.status === "PAID" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
                <CheckCircle2 className="w-4 h-4" /> Paid
              </span>
            ) : (
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-700">
                {payment.status}
              </span>
            )}
          </div>
        </section>

        <section className="border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 text-gray-900">
                  <div className="font-medium">Teaching honorarium</div>
                  <div className="text-xs text-gray-500">{payment.teacher.user.name}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{payment.month}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(Number(payment.amount))}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</td>
                <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                  {formatCurrency(Number(payment.amount))}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Payment Method</p>
            <p className="text-gray-900 capitalize">
              {payment.paymentMethod.replace("_", " ").toLowerCase()}
            </p>
          </div>
          {payment.referenceNumber && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Reference</p>
              <p className="text-gray-900">{payment.referenceNumber}</p>
            </div>
          )}
        </section>

        {payment.notes && (
          <section className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{payment.notes}</p>
          </section>
        )}

        <footer className="mt-16 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs text-gray-500">
          <div>
            <div className="border-t border-gray-300 pt-2 mt-8 text-center">Recipient signature</div>
          </div>
          <div>
            <div className="border-t border-gray-300 pt-2 mt-8 text-center">Authorised signatory</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
