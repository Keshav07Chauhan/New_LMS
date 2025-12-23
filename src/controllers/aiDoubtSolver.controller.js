import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);

const askAI = async (req, res) => {
  const { question } = req.body;
  try {
    const chatCompletion = await client.chatCompletion({
      model: "openai/gpt-oss-120b:fastest",
      messages: [
        {
          role: "system",
          content: `You are BuddyBee, an intelligent personal learning buddy.
          If you know the answer to a question, answer it directly in plain English.
          Otherwise, say directly "Sorry buddy, can not get the answer".`,
        },
        {
          role: "user",
          content: `${question}`,
        },
      ],
    });

    const result = chatCompletion.choices[0].message.content;
    res.json({ answer: result || "No answer generated." });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Failed to generate answer from Hugging Face" });
  }
};

export { askAI };
