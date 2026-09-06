import { Disclosure } from "@/components/disclosure";

export function Faq({ items, id = "faq" }: { items: { data: { question: string; answer: string } }[]; id?: string }) {
  return (
    <div className="reveal" data-reveal>
      {items.map((item, index) => (
        <Disclosure key={`${id}-${index}`} id={`${id}-${index}`} group={id} title={item.data.question}>
          <p className="m-0">{item.data.answer}</p>
        </Disclosure>
      ))}
    </div>
  );
}
