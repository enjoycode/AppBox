using System;
using System.Collections.Generic;

namespace PixUI.Test.Mac
{
    internal sealed class Person
    {
        public string Name { get; set; }
        public int Score { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Memo { get; set; }
        public bool Female { get; set; }

        public static IList<Person> GeneratePersons(int count)
        {
            var random = new Random();
            var ls = new List<Person>(count);
            for (var i = 0; i < count; i++)
            {
                ls.Add(new Person()
                {
                    Name = "Name" + i,
                    Female = i % 2 == 0,
                    Score = random.Next(),
                });
            }

            return ls;
        }
    }
}